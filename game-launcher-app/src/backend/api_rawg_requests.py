import httpx, asyncio, json, os
from dotenv import load_dotenv

load_dotenv(verbose=True)

baseGamesUrl = os.getenv("BASE_GAMES_URL")
apiKey = os.getenv("RAWG_API_KEY")


async def GetGameDetails(gameName):
    async with httpx.AsyncClient(base_url=baseGamesUrl) as client:
        r = await client.get(f"/games/{gameName}?key={apiKey}")
        data = r.json()

        screenshots = await client.get(f"/games/{gameName}/screenshots?key={apiKey}")
        images = screenshots.json()

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