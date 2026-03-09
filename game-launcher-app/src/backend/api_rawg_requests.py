import httpx, asyncio, json

apiKey = "2e457f28ca4d42d086a5f6e936b07d5f"
baseGamesUrl = f"https://api.rawg.io/api"

async def GetGameDetails(gameName):
    async with httpx.AsyncClient(base_url=baseGamesUrl) as client:
        r = await client.get(f"/games/{gameName}?key={apiKey}")
        data = r.json()

        print(json.dumps(data, indent=4))

asyncio.run(GetGameDetails("raft"))