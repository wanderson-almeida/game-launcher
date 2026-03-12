using MonoTorrent;
using MonoTorrent.Client;

string magnet = args[0];
string downloadPath = args.Length > 1 ? args[1] : "C:\\Games\\Downloads";
// pro usuario poder escolher onde quer baixar, ou usar um padrao

var engine = new ClientEngine();
var magnetLink = MagnetLink.Parse(magnet);

var manager = await engine.AddAsync(magnetLink, "C:\\Games\\Download");
await manager.StartAsync();

while (manager.State != TorrentState.Seeding)
{
    Console.WriteLine($"Progresso: {manager.Progress}%");
    Console.Out.Flush(); // pra poder ver o progresso do download pelo front, tem q recompilar mas eu to com preguiça, trabalhe braia (recompile usando isso aqui "dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true")
    await Task.Delay(1000);
}

Console.WriteLine("Download completo!");