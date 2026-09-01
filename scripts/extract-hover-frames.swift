import AVFoundation
import ImageIO
import UniformTypeIdentifiers
import Foundation

let arguments = CommandLine.arguments
guard arguments.count == 3 else { exit(2) }
let source = URL(fileURLWithPath: arguments[1]), output = URL(fileURLWithPath: arguments[2], isDirectory: true)
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let asset = AVURLAsset(url: source), duration = CMTimeGetSeconds(asset.duration)
guard duration.isFinite && duration > 0 else { exit(3) }
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.maximumSize = CGSize(width: 1200, height: 1200)
generator.requestedTimeToleranceBefore = CMTime(seconds: 0.35, preferredTimescale: 600)
generator.requestedTimeToleranceAfter = CMTime(seconds: 0.35, preferredTimescale: 600)
for index in 0..<20 {
  let progress = 0.03 + (Double(index) / 19.0) * 0.89
  let image = try generator.copyCGImage(at: CMTime(seconds: duration * progress, preferredTimescale: 600), actualTime: nil)
  let url = output.appendingPathComponent(String(format: "frame-%02d.jpg", index))
  guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else { continue }
  CGImageDestinationAddImage(destination, image, [kCGImageDestinationLossyCompressionQuality: 0.86] as CFDictionary)
  CGImageDestinationFinalize(destination)
}
