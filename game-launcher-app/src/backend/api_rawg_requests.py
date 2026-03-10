import aiohttp, asyncio, json, os
from dotenv import load_dotenv

load_dotenv(verbose=True)

baseGamesUrl = os.getenv("BASE_GAMES_URL")
apiKey = os.getenv("RAWG_API_KEY")


async def GetGameDetails(gameName):
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{baseGamesUrl}/games/{gameName}?key={apiKey}") as r:
            data = await r.json()

        async with session.get(f"{baseGamesUrl}/games/{gameName}/screenshots?key={apiKey}") as screenshots:
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

        print(json.dumps(organized, indent=4))


asyncio.run(GetGameDetails("hytale"))