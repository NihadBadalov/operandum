# operandum
This is the documentation for the Tasks.

**Tasks are a very powerful feature of operandum, featuring variables,
built-in functions, and more.**

Your Tasks folder's name is `tasks` by default. If you changed it,
you can see its name in `operandum.ini` [configuration file](Configuration.md).


## Table of Contents
- [Running Tasks](#running-tasks)
- [Task Files](#task-files)
- [Action's Parameters](#actions-parameters)
- [Built-in Functions](#built-in-functions)

### Running Tasks
To run a Task, use the following command:
```bash
operandum execute <task-name>
```

### Task Files
Task files are written in the YAML format.
<br>
Here is an **example** of a Task file:
```yaml
vars:
  - name: ssh_files
    value: "./ssh/*"
actions:
  - name: Decrypt ssh files
    operandum.builtin.decrypt:
      src: "{{ ssh_files }}"
      password: 12345678
      # No need to use ask_encryption_password if you have the password
      # ask_encryption_password: true
    superuser: false
    ignore_errors: false

  - name: "Copy ssh files to ~/.ssh"
    operandum.builtin.copy:
      src: "{{ ssh_files }}"
      dest: "~/.ssh"
      recursive: true
    superuser: false
    ignore_errors: false

  - name: Encrypt ssh files
    operandum.builtin.encrypt:
      src: "{{ ssh_files }}"
      ask_encryption_password: true
    superuser: false
    ignore_errors: false
```

**Short explanation:**
- The `vars` section is for defining variables.
  - If you don't need variables, you can fully skip and not write the `vars` section (including the `vars:` line).
- The `actions` section is for defining actions.
  - The `name` parameter (the only **REQUIRED** parameter for an Action) is the name of the action.
  - The `superuser` parameter is for running the action as a superuser (sudo).
  - The `ignore_errors` parameter is for ignoring errors.
    - If `true`, the Task will continue even if the action fails. (TODO - not implemented yet - that the task fails when the action fails)
  - The `operandum.builtin` parameter is the name of the built-in function.
    - The `src`, `dest`, and `recursive` parameters are parameters of the TODO built-in function.

### Action's Parameters
| Name | Required | Value type | Default | Meaning |
| --------------- | --------------- | --------------- | --------------- | --------------- |
| name | ✅ | string (text) | - | Name of the Action |
| action | ❌ | string (text) | - | A `shell` script to run |
| superuser | ❌ | boolean ("true" or "false") | false | Whether to run the Action as superuser (sudo) |
| ignore_errors | ❌ | boolean ("true" or "false") | false | Whether to ignore errors<br>If `true`, the Task will continue even if the action fails |
| built-in functions | ❌ | object/dictionary | - | - |

### Built-in Functions
The following is a list of built-in functions that can be used in Tasks:
- [`operandum.builtin.copy`](Builtin_Functions/copy.md)
- [`operandum.builtin.decrypt`](Builtin_Functions/decrypt.md)
- [`operandum.builtin.encrypt`](Builtin_Functions/encrypt.md)
