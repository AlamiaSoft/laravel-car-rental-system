how we add laravel boost mcp to Antigravity IDE???

Adding Laravel Boost to Antigravity IDE is a fantastic way to supercharge your AI workflows. It runs a local Model Context Protocol (MCP) server directly inside your Laravel app via an Artisan command, allowing the IDE's AI agent to seamlessly inspect your database schemas, application routes, logs, and run Tinker commands without guessing.  
Learn with Mux

Here is the exact step-by-step process to get it up and running.

The Installation Process
1
Install Laravel Boost via Composer
Run in your Laravel project root
Open your local terminal and install the package as a development dependency:

Bash
composer require laravel/boost --dev
2
Initialize Boost
Generate files & guidelines
Run the installer command. This will scan your dependencies, set up local AI guidelines (CLAUDE.md, AGENTS.md), and prepare the MCP bridge:

Bash
php artisan boost:install
3
Open Antigravity's MCP Configuration
Inside Antigravity IDE
Look at the top of the editor's Agent Side Panel and click the three dots (...).

Select MCP Servers from the dropdown menu.

Click Manage MCP Servers, and then click View raw config.

Alternatively, you can manually open or create the configuration file at .agents/mcp_config.json right in your project's root folder.

4
Inject the Laravel Boost Server Definition
Update the JSON file
Add the laravel-boost server definition block into your mcpServers object and save the file. (See the JSON configurations below based on your stack setup).


The Configuration Snippets
Depending on how your local environment is running, select the block that matches your environment and add it to your mcp_config.json:

Option A: Standard Local Setup (Native PHP)
If you run PHP natively on your host machine or via a local toolset, use this setup:

JSON
{
  "mcpServers": {
    "laravel-boost": {
      "command": "php",
      "args": ["artisan", "boost:mcp"]
    }
  }
}
Option B: Docker Compose Setup
If your app runs containerized inside a Docker environment, the IDE needs to run the command inside the running container (-T is crucial to disable pseudo-TTY allocation over stdio):

JSON
{
  "mcpServers": {
    "laravel-boost": {
      "command": "docker",
      "args": [
        "compose",
        "exec",
        "-T",
        "app", 
        "php",
        "artisan",
        "boost:mcp"
      ]
    }
  }
}
(Make sure to change "app" to whatever your PHP/Laravel service name is inside your docker-compose.yml file, such as web or php).

Option C: Laravel Sail Setup
If you are leveraging Laravel's default Sail environment wrapper, point the command directly to your local Sail binary:

JSON
{
  "mcpServers": {
    "laravel-boost": {
      "command": "./vendor/bin/sail",
      "args": ["artisan", "boost:mcp"]
    }
  }
}
Pro Tip: Once you've saved the config file, click the Settings gear icon on the bottom left of Antigravity, head over to the Customizations tab, and hit Refresh under Installed MCP Servers. The first time your AI agent invokes a Laravel Boost tool (like fetching your DB schema), Antigravity will prompt you for approval—simply click allow, and you're good to go!