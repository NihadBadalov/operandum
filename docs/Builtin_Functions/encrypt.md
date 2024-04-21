# operandum
This is the documentation for the Built-in Functino `encrypt`.

### Parameters
| Parameter | Required | Description |
| --- | --- | --- |
| `src` | ✅ | The source file or folder. |
| `password` | ❌* | The password for encryption. |
| `ask_encryption_password` | ❌ | If `true`, the user will be prompted for the encryption password. Default is `false` (unless no password has been provided). |

*If no password is provided, the user will be prompted for the password.

### Example
```yaml
actions:
  - name: Encrypt ssh files
    operandum.builtin.encrypt:
      src: "./ssh/*"
      ask_encryption_password: true
```

### Notes
- If the `password` parameter is provided and the `ask_encryption_password` parameter is `true`,
the user will be prompted for the password
- The `src` path **CANNOT** yet contain the wildcard `*` for multiple files. - TODO
- The `src` path can be relative or absolute.
- The `src` path can **ONLY** be a file (not a directory).
