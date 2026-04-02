import aiohttp
import asyncio
import json
import os
import threading
import time
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# api rawg
baseGamesUrl = os.getenv("BASE_GAMES_URL")
apiKey = os.getenv("RAWG_API_KEY")

#jogos

@app.get("/")
async def root():
    return {"message": "API está funcionando!"}


@app.get("/games")
async def get_games(page: int = 1, page_size: int = 20):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{baseGamesUrl}/games?key={apiKey}&page_size={page_size}&page={page}"
            ) as r:
                if r.status != 200:
                    return {"error": f"Erro na API: {r.status}"}
                data = await r.json()
                return data["results"]
    except Exception as e:
        return {"error": str(e)}


@app.get("/games/{gameId}")
async def get_game_details(gameId: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{baseGamesUrl}/games/{gameId}?key={apiKey}") as r:
                data = await r.json()

            async with session.get(f"{baseGamesUrl}/games/{gameId}/screenshots?key={apiKey}") as screenshots:
                images = await screenshots.json()

        return {
            "id": data["id"],
            "name": data["name"],
            "description": data.get("description", ""),
            "background_image": data.get("background_image"),
            "screenshots": [s["image"] for s in images.get("results", [])]
        }

    except Exception as e:
        return {"error": str(e)}

#magnet links

JSON_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "onlinefix.json")


def load_magnets():
    try:
        with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("downloads", [])
    except:
        return []


def normalize_name(name):
    import re
    name = name.lower()
    name = re.sub(r'[^\w\s]', '', name)
    return name.strip()


@app.get("/magnet-links/search")
async def search_magnet(game_name: str):
    downloads = load_magnets()
    normalized_search = normalize_name(game_name)

    for item in downloads:
        title = item.get("title", "")
        uris = item.get("uris", [])

        if not uris:
            continue

        clean_title = title.split(" Build")[0]
        normalized_title = normalize_name(clean_title)

        if normalized_search in normalized_title:
            return {
                "success": True,
                "magnet": uris[0],
                "title": title
            }

    return {"success": False}


#download

download_status = {}


class DownloadRequest(BaseModel):
    magnet_link: str
    game_name: str
    game_id: int


def fake_progress(game_id):
    game_id = str(game_id)  

    for i in range(1, 101):
        time.sleep(0.3)
        download_status[game_id]["progress"] = i
        download_status[game_id]["message"] = f"{i}%"

    download_status[game_id]["status"] = "completed"
    download_status[game_id]["message"] = "Download concluído!"


@app.post("/download/start")
async def start_download(request: DownloadRequest):
    try:
        exe_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "c#",
            "torrent-downloader",
            "bin",
            "Debug",
            "net9.0",
            "torrent-downloader.exe"
        )

        exe_path = os.path.abspath(exe_path)

        print("CAMINHO EXE:", exe_path)
        print("EXISTE?", os.path.exists(exe_path))

        # status
        download_status[str(request.game_id)] = {
            "status": "downloading",
            "progress": 0,
            "message": "Iniciando..."
        }

        # roda exe
        subprocess.Popen(
            [exe_path, request.magnet_link],
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )

        # progresso fake
        threading.Thread(
            target=fake_progress,
            args=(str(request.game_id),),
            daemon=True
        ).start()

        return {
            "success": True,
            "message": f"Download iniciado para {request.game_name}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download/status/{game_id}")
async def get_status(game_id: str):
    return download_status.get(game_id, {
        "status": "not_started",
        "progress": 0,
        "message": ""
    })


@app.post("/download/cancel/{game_id}")
async def cancel_download(game_id: str):
    download_status[game_id] = {
        "status": "cancelled",
        "progress": 0,
        "message": "Cancelado"
    }
    return {"success": True}