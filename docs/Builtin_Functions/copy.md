# operandum
This is the documentation for the Built-in Functino `copy`.

### Parameters
| Parameter | Required | Description |
| --- | --- | --- |
| `src` | ✅ | The source file or folder. |
| `dest` | ✅ | The destination file or folder. |
| `recursive` | ❌ | If `true`, the source folder will be copied recursively. Default is `false`. |

### Example
```yaml
actions:
  - name: Copy ssh files to ~/.ssh
    operandum.builtin.copy:
      # For the line below, assume there is a folder named `ssh`
      # in the same directory as the Task file.
      src: "./ssh/*"
      dest: "~/.ssh"
      recursive: true
```

### Notes
- The command functions as a `cp` command.
- The recursive option is equivalent to the `-r` flag in the `cp` command.
- The `src` and `dest` paths can be relative or absolute.
- The `src` path can contain the wildcard `*` only for children of a folder.
  - For example, `./ssh/*` will copy all files and folders inside the `ssh` folder.
- The `dest` path can be a folder or a file.
