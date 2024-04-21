# operandum
This is the documentation for the Built-in Functino `decrypt`.

### Parameters
| Parameter | Required | Description |
| --- | --- | --- |
| `src` | ✅ | The source file or folder. |
| `password` | ❌* | The password for encryption (to decrypt the file). |
| `ask_encryption_password` | ❌ | If `true`, the user will be prompted for the encryption password. Default is `false` (unless no password has been provided). |

*If no password is provided, the user will be prompted for the password.

### Example
```yaml
actions:
  - name: Decrypt ssh files
    operandum.builtin.decrypt:
      src: "{{ ssh_files }}"
      password: 12345678
      # No need to use ask_encryption_password if you have the password
      # ask_encryption_password: true
```

### Notes
- ***If no password is provided, the user will be prompted for the password.***
- If the `password` parameter is provided and the `ask_encryption_password` parameter is `true`,
the user will be prompted for the password
- The `src` path **CANNOT** yet contain the wildcard `*` for multiple files. - TODO
- The `src` path can be relative or absolute.
- The `src` path can **ONLY** be a file (not a directory).
