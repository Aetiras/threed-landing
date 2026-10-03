# Paylaşım görselindeki parça public/files/braket.stl'nin gerçek üçgenlerinden çizilir.
# Windows / System.Drawing; dış görsel, Python veya ücretli servis gerektirmez.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;
using System.Linq;

public static class ThreeDShareImage {
    class Face { public PointF[] Points; public double Depth; public double Light; }
    public static void Render(string input, string output) {
        var faces = new List<Face>();
        using (var reader = new BinaryReader(File.OpenRead(input))) {
            reader.ReadBytes(80);
            var count = reader.ReadUInt32();
            if (count == 0 || reader.BaseStream.Length != 84L + count * 50L) throw new Exception("Beklenen ikili STL biçimi bulunamadı");
            for (uint i = 0; i < count; i++) {
                double nx = reader.ReadSingle(), ny = reader.ReadSingle(), nz = reader.ReadSingle();
                var face = new Face { Points = new PointF[3], Light = Math.Max(.18, Math.Abs(nx * -.25 + ny * -.35 + nz * .82)) };
                for (int j = 0; j < 3; j++) {
                    double x = reader.ReadSingle(), y = reader.ReadSingle(), z = reader.ReadSingle();
                    face.Points[j] = new PointF((float)(.7071*x - .7071*y), (float)(.4082*x + .4082*y - .8165*z));
                    face.Depth += x + y + z;
                }
                reader.ReadUInt16();
                faces.Add(face);
            }
        }
        float minX = faces.Min(f => f.Points.Min(p => p.X)), maxX = faces.Max(f => f.Points.Max(p => p.X));
        float minY = faces.Min(f => f.Points.Min(p => p.Y)), maxY = faces.Max(f => f.Points.Max(p => p.Y));
        float scale = Math.Min(480f/(maxX-minX), 400f/(maxY-minY));
        float offsetX = 625 + (480 - (maxX-minX)*scale)/2, offsetY = 140 + (400 - (maxY-minY)*scale)/2;
        using (var bitmap = new Bitmap(1200, 630))
        using (var graphics = Graphics.FromImage(bitmap)) {
            graphics.Clear(Color.FromArgb(243,242,237));
            graphics.SmoothingMode = SmoothingMode.AntiAlias;
            graphics.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            using (var line = new Pen(Color.FromArgb(220,217,208), 1)) {
                graphics.DrawLine(line, 52, 108, 1148, 108);
                graphics.DrawLine(line, 52, 560, 1148, 560);
                graphics.DrawLine(line, 582, 145, 582, 520);
            }
            using (var green = new SolidBrush(Color.FromArgb(11,124,73)))
            using (var greenLight = new SolidBrush(Color.FromArgb(18,183,106)))
            using (var greenSide = new SolidBrush(Color.FromArgb(125,203,163))) {
                graphics.FillPolygon(greenLight, new[] { new PointF(52,56),new PointF(69,46),new PointF(86,56),new PointF(69,66) });
                graphics.FillPolygon(green, new[] { new PointF(52,56),new PointF(69,66),new PointF(69,85),new PointF(52,75) });
                graphics.FillPolygon(greenSide, new[] { new PointF(69,66),new PointF(86,56),new PointF(86,75),new PointF(69,85) });
            }
            using (var ink = new SolidBrush(Color.FromArgb(22,24,26)))
            using (var secondary = new SolidBrush(Color.FromArgb(71,76,82)))
            using (var accent = new SolidBrush(Color.FromArgb(11,124,73)))
            using (var brand = new Font("Segoe UI", 28, FontStyle.Bold, GraphicsUnit.Pixel))
            using (var title = new Font("Segoe UI", 48, FontStyle.Bold, GraphicsUnit.Pixel))
            using (var small = new Font("Segoe UI", 21, FontStyle.Regular, GraphicsUnit.Pixel)) {
                graphics.DrawString("threeD", brand, ink, 101, 44);
                graphics.DrawString("Türkçe parametrik mekanik CAD", small, secondary, 52, 150);
                graphics.DrawString("Parçayı tarif et.", title, ink, 48, 218);
                graphics.DrawString("Özellik ağacı", title, ink, 48, 278);
                graphics.DrawString("senin kalsın.", title, accent, 48, 338);
                graphics.DrawString("Model · montaj · teknik resim", small, secondary, 52, 578);
                graphics.DrawString("Motor braketi / gerçek threeD çıktısı", small, secondary, 705, 578);
            }
            graphics.SmoothingMode = SmoothingMode.None;
            foreach (var face in faces.OrderBy(f => f.Depth)) {
                var projected = face.Points.Select(p => new PointF(offsetX+(p.X-minX)*scale, offsetY+(p.Y-minY)*scale)).ToArray();
                int shade = (int)(135 + face.Light * 75);
                using (var brush = new SolidBrush(Color.FromArgb(Math.Min(235,shade), Math.Min(239,shade+5), Math.Min(245,shade+11)))) graphics.FillPolygon(brush, projected);
            }
            bitmap.Save(output, ImageFormat.Png);
        }
    }
}
'@

$landingRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$meshPath = Join-Path $landingRoot 'public/files/braket.stl'
$imagePath = Join-Path $landingRoot 'public/brand/threed-paylasim.png'
[ThreeDShareImage]::Render($meshPath, $imagePath)
Write-Output ('Paylaşım görseli üretildi: ' + $imagePath)
