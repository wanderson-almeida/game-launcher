import aiohttp
import asyncio
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv()


app = FastAPI()


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


baseGamesUrl = os.getenv("BASE_GAMES_URL")
apiKey = os.getenv("RAWG_API_KEY")

print("URL:", baseGamesUrl)
print("KEY:", apiKey[:5] + "..." if apiKey else "Não encontrada")

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
            # pegar detalhes do jogo
            async with session.get(f"{baseGamesUrl}/games/{gameId}?key={apiKey}") as r:
                if r.status != 200:
                    return {"error": "Jogo não encontrado"}
                data = await r.json()

            # pegar screenshots
            async with session.get(f"{baseGamesUrl}/games/{gameId}/screenshots?key={apiKey}") as screenshots:
                images = await screenshots.json()

        # organizar os dados
        organized = {
            "id": data["id"],
            "name": data["name"],
            "name_original": data.get("name_original", data["name"]),
            "released": data.get("released"),
            "updated": data.get("updated"),
            "achievements_count": data.get("achievements_count", 0),
            "rating": data.get("rating", 0),
            "ratings_count": data.get("ratings_count", 0),
            "playtime": data.get("playtime", 0),
            "description": data.get("description", ""),
            "background_image": data.get("background_image"),
            "background_image_additional": data.get("background_image_additional"),
            "screenshots": [screenshot["image"] for screenshot in images.get("results", [])]
        }

        return organized
    except Exception as e:
        return {"error": str(e)}
    

