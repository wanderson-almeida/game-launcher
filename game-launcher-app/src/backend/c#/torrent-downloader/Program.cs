using MonoTorrent;
using MonoTorrent.Client;

string magnet = args[0];

var engine = new ClientEngine();

var magnetLink = MagnetLink.Parse(magnet);

var manager = await engine.AddAsync(magnetLink, "C:\\Games\\Download");

await manager.StartAsync();

while (manager.State != TorrentState.Seeding)
{
    Console.WriteLine($"Progresso: {manager.Progress}%");
    await Task.Delay(1000);
}

Console.WriteLine("Download completo!");