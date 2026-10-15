import pathlib,re,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
def luminance(value):
    parts=[int(value[i:i+2],16)/255 for i in (0,2,4)]
    parts=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in parts]
    return sum(a*b for a,b in zip(parts,[.2126,.7152,.0722]))
def contrast(a,b):
    low,high=sorted([luminance(a),luminance(b)]);return (high+.05)/(low+.05)
class ThemeContrast(unittest.TestCase):
    def test_actual_native_tokens_keep_text_and_controls_visible(self):
        file=ROOT/'Sources/SecureTheme.swift'
        self.assertTrue(file.exists(),'Native paired colour roles are missing')
        colors=dict(re.findall(r'static let (\w+) = Color\(hex: 0x([0-9A-Fa-f]{6})\)',file.read_text()))
        for fg,bg in [('text','surface'),('secondaryText','surface'),('text','field'),('surface','brand'),('completeText','completeFill'),('warningText','warningFill'),('errorText','errorFill')]:
            self.assertGreaterEqual(contrast(colors[fg],colors[bg]),4.5,(fg,bg))
        self.assertGreaterEqual(contrast(colors['border'],colors['field']),3)
