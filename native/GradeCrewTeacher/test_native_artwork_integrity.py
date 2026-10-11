"""Reject the truncated PNG that previously passed the TestFlight artwork check."""
from pathlib import Path
import ast
import struct
import tempfile
import zlib

root = Path(__file__).parent
script = ast.parse((root / 'prepare_testflight_assets.py').read_text())
verify = next(n for n in script.body if isinstance(n, ast.FunctionDef) and n.name == 'verify_png')
namespace = {'struct': struct, 'zlib': zlib, 'SIZE': 1024, 'Path': Path}
exec(compile(ast.Module(body=[verify], type_ignores=[]), 'prepare_testflight_assets.py', 'exec'), namespace)
check = namespace['verify_png']
source = root.parent.parent / 'assets/gradecrew/remy-microphone-v1.png'
check(source, expected_size=None, opaque=False)
with tempfile.TemporaryDirectory() as folder:
    broken = Path(folder) / 'truncated.png'
    broken.write_bytes(source.read_bytes()[:786444])
    try:
        check(broken, expected_size=None, opaque=False)
    except SystemExit:
        pass
    else:
        raise AssertionError('Truncated artwork must fail before packaging the app')
print('Native artwork integrity: passed (complete PNG and truncated upload regression)')
