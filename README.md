# operandum
[![Node.js Package](https://github.com/NihadBadalov/operandum/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/NihadBadalov/operandum/actions/workflows/npm-publish.yml)

An easy-to-use secure Dotfiles, Tasks and Scripts manager for **UNIX systems** (Linux, Macos, etc.)

Currently, it's in development; **however,** it can be used for stowing Dotfiles
and running tasks.

[User's example](https://github.com/NihadBadalov/.dotfiles)
<br>
[Documentation example](docs/examples/Simple_Stow/README.md)

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Stowing Dotfiles](#stowing-dotfiles)
  - [Running Tasks](#running-tasks)
- [Commands](#commands)
- [Feedback and Contributing](#feedback-and-contributing)
- [License](#license)

## Installation
Currently, operandum can only be installed using npm. To install it, run the following command:
```bash
npm install -g operandum
```

*Pay attention that the package has to be installed using the `-g` flag to be
able to globally use the `operandum` commands.*

## Usage
### Initialization
Say, you have a directory with your dotfiles, tasks, and scripts at `~/.dotfiles` (`$HOME/.dotfiles`). To initialize operandum, run the following command:
```bash
cd ~/.dotfiles
operandum init
```

After running `operandum init`, you are going to be asked a few questions to set up the configuration file.
If you answered wrongly or want to change the configuration, you can run `operandum reinit`.

The configuration file is a single file - `operandum.ini`.
It is located in the root of the directory where you initialized operandum.
(For example, `~/.dotfiles/operandum.ini`, where `~/.dotfiles` is the root directory.)

The initial congifuration file is going to look like this:

```ini
; operandum - INI config file

dotfiles=dotfiles
tasks=tasks
```

If you changed the default values for Dotfiles and Tasks folders during your initialization,
you're going to see the following in your config:
`dotfiles=(name of the folder you chose without parenthesis)` and the same for the tasks.

*To see properties for the configuration file, check the [Configuration](docs/Configuration.md) page.*

### Stowing Dotfiles
Your Dotfiles folder's name is `dotfiles` by default. If you changed it,
you can see its name in `operandum.ini` [configuration file](docs/Configuration.md).

Locations for stowing (or symlinking) your Dotfiles are defined in the `locations.ini` file.
The `locations.ini` file has a format of:
```ini
filename=/path/to/destination
exapmle=$HOME/.config
```

<br>

##### Example
Now, for the sake of the example, move your Dotfiles inside of the Dotfiles folder.
<br>
Say, you have the following structure:

```
--------------------------
~/.dotfiles (root folder)
--------------------------
| bin/
|  | .local/...
|  | testfile/...
|  | test.txt
|  | locations.ini
|  | ^-- {  ; locations.ini contents
|  | ^-- {  ; Wildcard '*' can be used
|  | ^-- {  *=$HOME
| git/
|  | .gitconfig
| nvim/
|  | .config/
|  |  | nvim/...
|  | locations.ini
|  | ^-- {  ; locations.ini contents
|  | ^-- {  .config=$HOME
| .gitignore
| .gitmodules
| English.keylayout
| locations.ignore
| package.json
| package-lock.json
--------------------------
```

And your `locations.ignore` file looks like this:
```
English.keylayout
package.json
package-lock.json
```

<br>

**So, what gets stowed where?**

- The files `English.keylayout`, `package.json`, and `package-lock.json` are going to be ignored,
because they are in `locations.ignore`
- The files in the `bin` folder are going to be stowed in the `$HOME` directory.
  - The `bin/.local` folder already (probably) exists in the `$HOME` directory,
which means its contents are going to be symlinked inside the `$HOME/.local` directory.
  <br>*(For example, `bin/.local/hello.txt` -> `$HOME/.local/hello.txt`)*

  - The `bin/testfile` folder doesn't exist in the `$HOME` directory, so the whole folder of `testfile` going to be symlinked to the `$HOME` directory. `bin/testfile` -> `$HOME/testfile`

  - The `bin/test.txt` file is going to be symlinked to the `$HOME` directory. `bin/test.txt` -> `$HOME/test.txt`

- The `git` directory doesn't have a `locations.ini` file, so it's files **(NOT folders)** are going to be symlinked to the `$HOME` directory.
`git/.gitconfig` -> `$HOME/.gitconfig`

- The `nvim/.config` folder is going to be symlinked to the `$HOME/.config` directory.
  - But because the `$HOME/.config` directory already exists, the contents of the `nvim/.config` folder are going to be symlinked inside the `$HOME/.config` directory.
  `nvim/.config/nvim` -> `$HOME/.config/nvim`

<br>

- There is no `locations.ini` in the `~/.dotfiles` directory, so the remaining
`.gitignore` and `.gitmodules` files are going to be symlinked to the `$HOME` directory.

  - `.gitignore` -> `$HOME/.gitignore`

  - `.gitmodules` -> `$HOME/.gitmodules`

**To stow your Dotfiles, run the following command:**
```bash
operandum stow -f
```
_**IMPORTANT: `-f` (force) is a recommended flag! Otherwise, the stowing process will stop if
the stowing-end-path is a symlink (i.e. a symlink exists)!**_

### Running Tasks
**Tasks are a very powerful feature of operandum, featuring variables,
built-in functions, and more.**

Your Tasks folder's name is `tasks` by default. If you changed it,
you can see its name in `operandum.ini` configuration file.

The tasks are defined in separate YAML files (e.g., `task1.yml`, `task2.yml`, etc.) in the Tasks folder.

<br>

##### Example
Because the Tasks and their compositon is a bit more complex,
there is a separate [Task Documentation](docs/Tasks.md).
<br>
Here is also the documentation for [Task Configuration](docs/Task_Configuration.md) and [Built-in Functions](docs/Builtin_Functions.md)
\- they both can be found in the Task Documentation.

## Commands
| Command  | Usage | Description                |
| :------  | :--------   | :------------------------- |
| `decrypt`| `operandum decrypt <filename>` | AES-256-CBC decryption of a file |
| `deinit` | `operandum deinit`             | Removes operandum and its config file in the current directory |
| `encrypt`| `operandum encrypt <filename>` | AES-256-CBC encryption of a file |
| `execute`| `operandum execute <task-name>`| Execute a task from the Tasks |
| `help`   | `operandum help`               | Shows a help message for operandum commands |
| `init`   | `operandum init`               | Initializes operandum and its config file in the current directory |
| `reinit` | `operandum reinit`             | Reinitializes operandum in the current directory |
| `stow`   | `operandum stow -f`               | Stows (symlinks) Dotfiles to their respective stow directories<br>More simply, this commands puts your Dotfiles in their places |
| `update` | `operandum update`             | (Git) pull Dotfiles from the remote repository |

## Feedback and Contributing
Errors and suggestions can be reported in the [Issues](https://github.com/NihadBadalov/operandum/issues)
section of the repository.

If you want to contribute to the project, you can fork the repository and create a pull request.

Contributions to documentation are also welcome.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
