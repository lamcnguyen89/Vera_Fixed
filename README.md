# Vera_Fixed

This is the Vera project fixed to allow the application to run

## To Get this project working on Windows do these things:

1. Install Windows Subsystem Linux (WSL). In Windows, open the command prompt as administrator and run the following command:

```
    wsl --install -d Ubuntu
```

2. Open a command prompt or bash terminal. Start WSL with the following command:

```
wsl -d Ubuntu
```

3. Once inside WSL, clone the repository.

4. Install Docker Desktop. Do a web search for Docker Desktop and install the executable.

5. Within Docker Desktop, go to the following Tabs/Menus

```
Settings -> Resources -> WSL Integration
```

Check on the box to "Enable integration with my default WSL distro"

Slide to On for the Linux Distro you want under "Enable Integration with additional distros.

4. Install VS Code.

5. For VS Code, install the following extensions:

- WSL

6. Within VS Code, start WSL. It should be the Blue Box at the bottom Left corner of the VS Code editor. VS Code will ask what distribution you want to use. Choose Ubuntu since that is what we installed

7. Once WSL is started, install the following VS Code extensions:

- Remote -SSH
- Remote Explorer
- Docker
- Github Pull Requests

8. Open a terminal and start WSL using the following command:

```
wsl -d Ubuntu
```

9. Once WSL is started in the terminal, it is time to install Node Package Manager, NPM and some other stuff. Use the following command to install curl

```
sudo apt-get install curl
```

10. Install NVM

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

11. Install Node Version 16 with the following command:

```
nvm install 16
```

12. Then use Node Version 16 by using the collowing command:

```
nvm use 16
```

13. In order for the application to run, you need to have the Docker Desktop Application started and running. Also make sure WSL is started in VS Code.
