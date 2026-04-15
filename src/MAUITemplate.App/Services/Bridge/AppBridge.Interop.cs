using System.Security.Cryptography;
using Microsoft.Extensions.Logging;

namespace MAUITemplate.App.Services.Bridge;

public sealed partial class AppBridge
{
    public Task StartBinaryStreamToJsAsync(int chunkByteLength = 256, int chunkCount = 20, int intervalMs = 250)
    {
        var normalizedChunkByteLength = Math.Clamp(chunkByteLength, 8, 16 * 1024);
        var normalizedChunkCount = Math.Clamp(chunkCount, 1, 200);
        var normalizedIntervalMs = Math.Clamp(intervalMs, 16, 2_000);
        var streamId = Guid.NewGuid().ToString("N");
        CancellationTokenSource cts;

        lock (_binaryStreamSyncRoot)
        {
            _binaryStreamCts?.Cancel();
            _binaryStreamCts?.Dispose();
            _binaryStreamCts = new CancellationTokenSource();
            cts = _binaryStreamCts;
        }

        _ = Task.Run(() => RunBinaryStreamAsync(
            streamId,
            normalizedChunkByteLength,
            normalizedChunkCount,
            normalizedIntervalMs,
            cts.Token));

        return SendEventToWebViewAsync(new
        {
            type = "bridgeStream.started",
            source = "csharp",
            streamId,
            chunkByteLength = normalizedChunkByteLength,
            chunkCount = normalizedChunkCount,
            intervalMs = normalizedIntervalMs,
            startedAt = DateTimeOffset.UtcNow,
        }, "bridge stream started");
    }

    public Task StopBinaryStreamToJsAsync()
    {
        CancellationTokenSource? cts;

        lock (_binaryStreamSyncRoot)
        {
            cts = _binaryStreamCts;
            _binaryStreamCts = null;
        }

        if (cts is null)
        {
            return SendEventToWebViewAsync(new
            {
                type = "bridgeStream.stopped",
                source = "csharp",
                reason = "idle",
                stoppedAt = DateTimeOffset.UtcNow,
            }, "bridge stream idle stop");
        }

        cts.Cancel();
        cts.Dispose();

        return Task.CompletedTask;
    }

    public Task<string> EchoTextAsync(string message)
    {
        return ExecuteSafeAsync(() => Task.FromResult(new
        {
            source = "csharp",
            message,
            length = message?.Length ?? 0,
            receivedAt = DateTimeOffset.UtcNow,
        }));
    }

    public Task<string> EchoBinaryAsync(string base64)
    {
        return ExecuteSafeAsync(() =>
        {
            var bytes = string.IsNullOrWhiteSpace(base64)
                ? Array.Empty<byte>()
                : Convert.FromBase64String(base64);

            return Task.FromResult(new
            {
                source = "csharp",
                byteLength = bytes.Length,
                checksum = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),
                base64 = Convert.ToBase64String(bytes),
            });
        });
    }

    public Task<string> SendTextMessageToJsAsync(string message)
    {
        return ExecuteSafeVoidAsync(() => SendEventToWebViewAsync(new
        {
            type = "bridgeDemo.text",
            source = "csharp",
            text = message,
            sentAt = DateTimeOffset.UtcNow,
        }, "bridge text message"));
    }

    public Task<string> SendBinaryMessageToJsAsync(int byteLength = 32)
    {
        return ExecuteSafeVoidAsync(() =>
        {
            var normalizedLength = Math.Clamp(byteLength, 1, 4096);
            var bytes = Enumerable.Range(0, normalizedLength)
                .Select(index => (byte)(index % 256))
                .ToArray();

            return SendEventToWebViewAsync(new
            {
                type = "bridgeDemo.binary",
                source = "csharp",
                byteLength = bytes.Length,
                checksum = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),
                base64 = Convert.ToBase64String(bytes),
                sentAt = DateTimeOffset.UtcNow,
            }, "bridge binary message");
        });
    }

    private async Task RunBinaryStreamAsync(
        string streamId,
        int chunkByteLength,
        int chunkCount,
        int intervalMs,
        CancellationToken cancellationToken)
    {
        try
        {
            for (var sequence = 0; sequence < chunkCount; sequence += 1)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var bytes = CreateBinaryStreamChunk(chunkByteLength, sequence);
                await SendEventToWebViewAsync(new
                {
                    type = "bridgeStream.chunk",
                    source = "csharp",
                    streamId,
                    sequence,
                    chunkCount,
                    byteLength = bytes.Length,
                    checksum = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),
                    base64 = Convert.ToBase64String(bytes),
                    sentAt = DateTimeOffset.UtcNow,
                }, "bridge stream chunk");

                if (sequence < chunkCount - 1)
                {
                    await Task.Delay(intervalMs, cancellationToken);
                }
            }

            await SendEventToWebViewAsync(new
            {
                type = "bridgeStream.completed",
                source = "csharp",
                streamId,
                chunkCount,
                chunkByteLength,
                completedAt = DateTimeOffset.UtcNow,
            }, "bridge stream completed");
        }
        catch (OperationCanceledException)
        {
            await SendEventToWebViewAsync(new
            {
                type = "bridgeStream.stopped",
                source = "csharp",
                streamId,
                reason = "cancelled",
                stoppedAt = DateTimeOffset.UtcNow,
            }, "bridge stream stopped");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to stream binary data to JS.");
            await SendEventToWebViewAsync(new
            {
                type = "bridgeStream.error",
                source = "csharp",
                streamId,
                message = ex.Message,
                failedAt = DateTimeOffset.UtcNow,
            }, "bridge stream error");
        }
        finally
        {
            lock (_binaryStreamSyncRoot)
            {
                if (_binaryStreamCts?.Token == cancellationToken)
                {
                    _binaryStreamCts?.Dispose();
                    _binaryStreamCts = null;
                }
            }
        }
    }

    private static byte[] CreateBinaryStreamChunk(int chunkByteLength, int sequence)
    {
        var bytes = new byte[chunkByteLength];
        for (var index = 0; index < bytes.Length; index += 1)
        {
            bytes[index] = (byte)((sequence * 31 + index) % 256);
        }

        return bytes;
    }
}