"""Run the real native authentication input policy with Swift/Foundation."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
policy = root / "Sources/GradeCrewAuthInputPolicy.swift"
assert policy.exists(), "Native authentication input policy is missing"

checks = r'''
func rejects(_ mode: GradeCrewAuthInputPolicy.Mode, _ email: String, _ password: String = "", name: String = "") {
    do {
        _ = try GradeCrewAuthInputPolicy.request(mode: mode, name: name, email: email, password: password)
        fatalError("Invalid authentication input was accepted")
    } catch {
        assert(!error.localizedDescription.isEmpty)
    }
}

// Removing format validation would admit these aliases and malformed addresses.
for address in ["", "martin", "lehrer@crew", "@example.com", "a@@example.com", "a b@example.com", "a\tb@example.com", "a@example.com\n", "a\u{0000}@example.com", "a@example..com", ".a@example.com", "a.@example.com", "a..b@example.com", "a@.example.com", "a@example.com.", "a@-example.com", "a@example-.com", "a@example.c", "a@example_com"] {
    rejects(.login, address, "password")
    rejects(.reset, address)
}
for address in ["teacher@example.com", "a.b+crew@school.example.de", "firstname-lastname@school.berlin", "a_b@sub.example.org", "o'brien@example.com"] {
    let request = try GradeCrewAuthInputPolicy.request(mode: .reset, name: "", email: address, password: "")
    assert(request.action == "authReset")
    assert(request.payload == ["email": address])
}

// Trimming the password would change the credentials sent to Firebase.
let login = try GradeCrewAuthInputPolicy.request(mode: .login, name: "unused", email: "  Teacher+crew@example.com  ", password: " a ")
assert(login.action == "authLogin")
assert(login.payload == ["email": "Teacher+crew@example.com", "password": " a "])
rejects(.login, "teacher@example.com")

// Registration has one password and a real name; no verification/confirmation step.
rejects(.register, "teacher@example.com", "123456", name: "   ")
rejects(.register, "teacher@example.com", "12345", name: "Martin")
let register = try GradeCrewAuthInputPolicy.request(mode: .register, name: "  Martin Müller  ", email: " teacher@example.com ", password: " 1234 ")
assert(register.action == "authRegister")
assert(register.payload == ["name": "Martin Müller", "email": "teacher@example.com", "password": " 1234 "])
// HTML minlength measures UTF-16 units, including non-ASCII passwords.
let unicodePassword = try GradeCrewAuthInputPolicy.request(mode: .register, name: "Martin", email: "teacher@example.com", password: "🤗🤗🤗")
assert(unicodePassword.payload["password"] == "🤗🤗🤗")
let reset = try GradeCrewAuthInputPolicy.request(mode: .reset, name: "ignored", email: " teacher@example.com ", password: "ignored")
assert(reset.payload == ["email": "teacher@example.com"])
print("GradeCrew auth input policy: passed (real email format, aliases rejected, mode payloads, password preservation)")
'''

with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "auth.swift"
    script.write_text(policy.read_text() + "\n" + checks)
    subprocess.run(["swift", "-module-cache-path", str(Path(work) / "module-cache"), str(script)], check=True)
