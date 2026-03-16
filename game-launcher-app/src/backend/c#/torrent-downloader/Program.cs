using System;
using System.IO;
using MonoTorrent;
using MonoTorrent.Client;
using SharpCompress.Archives;
using SharpCompress.Common;
using SharpCompress.Readers;

string defaultPath = @"C:\Games\Downloads";

string magnet = args[0];
string downloadPath = args.Length > 1 ? args[1] : defaultPath;
// pro usuario poder escolher onde quer baixar, ou usar um padrao

var engine = new ClientEngine();
var magnetLink = MagnetLink.Parse(magnet);

var manager = await engine.AddAsync(magnetLink, downloadPath);

await manager.StartAsync();

while (manager.State != TorrentState.Seeding)
{
    Console.WriteLine($"PROGRESSO: {manager.Progress:F2}%");
    Console.Out.Flush();
    await Task.Delay(1000);
}

Console.WriteLine("Download completo!");
await manager.StopAsync();
engine.Dispose();

await Task.Delay(500);

string gameFolder = Path.Combine(downloadPath, manager.Torrent!.Name);
Console.WriteLine($"Pasta do jogo: {gameFolder}");

string rarPassword = "online-fix.me";
var rarFiles = Directory.GetFiles(gameFolder, "*.rar", SearchOption.AllDirectories);

foreach (var rarFile in rarFiles)
{
    Console.WriteLine($"Extraindo: {rarFile}");

    using (var archive = ArchiveFactory.OpenArchive(
        rarFile,
        new ReaderOptions { Password = rarPassword }))
    {
        foreach (var entry in archive.Entries)
        {
            if (!entry.IsDirectory)
            {
                entry.WriteToDirectory(gameFolder, new ExtractionOptions
                {
                    ExtractFullPath = true,
                    Overwrite = true
                });
            }
        }
    }
}

Console.WriteLine("Extração finalizada.");