import httpx, asyncio, json, os
from dotenv import load_dotenv

load_dotenv(verbose=True)

baseGamesUrl = os.getenv("BASE_GAMES_URL")
apiKey = os.getenv("RAWG_API_KEY")


async def GetGameDetails(gameName):
    async with httpx.AsyncClient(base_url=baseGamesUrl) as client:
        r = await client.get(f"/games/{gameName}?key={apiKey}")
        data = r.json()

        organized = {
            "id": data["id"],
            "name_original": data["name_original"],
            "description": data["description"],
            "released": data["released"],
            "updated": data["updated"],
            "background_image": data["background_image"],
            "background_image_additional": data["background_image_additional"],
            "playtime": data["playtime"],
            "achievements_count": data["achievements_count"],
            "rating": data["rating"],
            "ratings_count": data["ratings_count"]
        }

        print(json.dumps(organized, indent=4))


asyncio.run(GetGameDetails("raft"))