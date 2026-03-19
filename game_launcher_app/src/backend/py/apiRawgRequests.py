import aiohttp, asyncio, json, os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ó, se liga

load_dotenv()


# criar api
app = FastAPI()

# aqui é pro react ou o front end ter acesso ao back

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

baseGamesUrl = os.getenv("BASE_GAMES_URL")
apiKey = os.getenv("RAWG_API_KEY")

print("URL:", baseGamesUrl)
print("KEY:", apiKey)

# aq é pra lista de jogos que tem na api

@app.get("/games")
async def get_games():
    # abre um sessao http:
    async with aiohttp.ClientSession() as session: 
        # faz uma requisição pra rawg:
        async with session.get(f"{baseGamesUrl}/games?key={apiKey}") as r:
            # pega a resposta e bota em json
            data = await r.json()
# pega e retorna a lista de jogos:
    return data ["results"]


@app.get("/games/{gameName}")
async def get_game_details(gameName: str):
    async with aiohttp.ClientSession() as session:
        # pega os dados dos jogos, como dados e screenshot:
        async with session.get(f"{baseGamesUrl}/games/{gameName}?key={apiKey}") as r:
            data = await r.json()

        async with session.get(f"{baseGamesUrl}/games/{gameName}/screenshots?keyh={apiKey}") as screenshots:
            images = await screenshots.json()


    organized = {
            "id": data["id"],
            "name_original": data["name_original"],
            "released": data["released"],
            "updated": data["updated"],
            "achievements_count": data["achievements_count"],
            "rating": data["rating"],
            "ratings_count": data["ratings_count"],
            "playtime": data["playtime"],
            "description": data["description"],
            "background_image": data["background_image"],
            "background_image_additional": data["background_image_additional"],
            "screenshots": [screenshot["image"] for screenshot in images["results"]]
        }

    return organized


