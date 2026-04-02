using System;
using System.IO;
using System.Threading.Tasks;
using MonoTorrent;
using MonoTorrent.Client;
using SharpCompress.Archives;
using SharpCompress.Common;

using SharpCompress.Readers;

class Program
{
    static async Task Main(string[] args)
    {
        try
        {
            // Verificar se recebeu magnet
            if (args.Length == 0)
            {
                Console.WriteLine("❌ Nenhum magnet recebido!");
                Console.ReadLine();
                return;
            }

            string magnet = args[0];
            Console.WriteLine("🔗 Magnet recebido:");
            Console.WriteLine(magnet);

            // Caminho de download
            string defaultPath = @"C:\Games\Downloads";
            string downloadPath = args.Length > 1 ? args[1] : defaultPath;

            Console.WriteLine(" Pasta de download:");
            Console.WriteLine(downloadPath);

            // Criar engine
            var engine = new ClientEngine();

            // Tentar ler o magnet
            MagnetLink magnetLink;
            try
            {
                magnetLink = MagnetLink.Parse(magnet);
            }
            catch (Exception ex)
            {
                Console.WriteLine(" Erro ao ler magnet:");
                Console.WriteLine(ex.Message);
                Console.ReadLine();
                return;
            }

            // Adicionar torrent
            var manager = await engine.AddAsync(magnetLink, downloadPath);

            Console.WriteLine(" Iniciando download...");
            await manager.StartAsync();

            // Loop de progresso
            while (manager.State != TorrentState.Seeding)
            {
                Console.WriteLine($" PROGRESSO: {manager.Progress:F2}%");
                await Task.Delay(1000);
            }

            Console.WriteLine(" Download completo!");
            await manager.StopAsync();
            engine.Dispose();

            await Task.Delay(500);

            //  Pasta do jogo
            string gameFolder = Path.Combine(downloadPath, manager.Torrent!.Name);
            Console.WriteLine($" Pasta do jogo: {gameFolder}");

            //  Extração
            string rarPassword = "online-fix.me";
            var rarFiles = Directory.GetFiles(gameFolder, "*.rar", SearchOption.AllDirectories);

            foreach (var rarFile in rarFiles)
            {
                Console.WriteLine($" Extraindo: {rarFile}");

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

            Console.WriteLine(" Extração finalizada!");
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERRO GERAL:");
            Console.WriteLine(ex.Message);
        }

        
        Console.WriteLine("\nPressione ENTER para sair...");
        Console.ReadLine();
    }
}