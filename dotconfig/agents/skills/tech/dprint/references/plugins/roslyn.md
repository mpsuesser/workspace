# Roslyn Plugin

Adapter plugin that formats C# and Visual Basic code via [Roslyn](https://github.com/dotnet/roslyn).

> [!WARNING]
> This is a process plugin. Using this will cause the CLI to download, run, and communicate with a separate process that is not sandboxed (unlike Wasm plugins).

## Install and Setup

Follow the instructions at [https://github.com/dprint/dprint-plugin-roslyn/releases/](https://github.com/dprint/dprint-plugin-roslyn/releases/)

## Configuration

C# configuration uses the [`CSharpFormattingOptions`](https://docs.microsoft.com/en-us/dotnet/api/microsoft.codeanalysis.csharp.formatting.csharpformattingoptions?view=roslyn-dotnet) (use `"csharp.<property name goes here>": <value goes here>` in the configuration file).

It does not seem like Roslyn supports any VB specific configuration.
