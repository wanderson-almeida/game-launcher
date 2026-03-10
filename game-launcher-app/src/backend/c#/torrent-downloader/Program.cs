using MonoTorrent;
using MonoTorrent.Client;

var engine = new ClientEngine();
var magnet = MagnetLink.Parse("magnet:?xt=urn:btih:65dc7c504e6e83de5a3c8db79283bfe64e50155c&dn=Fraymakers&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337");

var manager = await engine.AddAsync(magnet, "C:\\Games\\Download");

await manager.StartAsync();

while (manager.State != TorrentState.Seeding)
{
    Console.WriteLine($"Progresso: {manager.Progress}%");
    await Task.Delay(1000);
}

Console.WriteLine("Download completo!");