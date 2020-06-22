using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;

namespace Pims.Api
{
    /// <summary>
    /// Program class, provides the main program starting point for the Geo-spatial application.
    /// </summary>
    public class Program
    {
        /// <summary>
        /// The primary entry point for the application.
        /// </summary>
        /// <param name="args"></param>
        public static void Main(string[] args)
        {
            var builder = CreateWebHostBuilder(args);
            builder.Build().Run();
        }

        /// <summary>
        /// Create a default configuration and setup for a web application.
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            DotNetEnv.Env.Load();
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: true)
                .AddJsonFile("connectionstrings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"connectionstrings.{env}.json", optional: true, reloadOnChange: true)
                .AddJsonFile("geocoder.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"geocoder.{env}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables()
                .AddCommandLine(args)
                .Build();

            return WebHost.CreateDefaultBuilder(args)
                .UseUrls(config.GetValue<string>("ASPNETCORE_URLS"))
                .UseStartup<Startup>();
        }
    }
}
