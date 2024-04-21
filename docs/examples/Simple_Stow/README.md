# operandum
**To stow your Dotfiles, run the following command:**
```bash
operandum stow
```

### So, what gets stowed where?

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
