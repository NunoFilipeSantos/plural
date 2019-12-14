import Config
import System, only: [get_env: 1]

config :watchman, WatchmanWeb.Endpoint,
  url: [host: get_env("HOST"), port: 80],
  check_origin: ["//#{get_env("HOST")}", "//watchman"]

config :watchman,
  workspace_root: "/app/app",
  git_url: get_env("GIT_URL"),
  repo_root: get_env("REPO_ROOT"),
  chartmart_config: "/ect/chartmart/.chartmart",
  webhook_secret: get_env("WEBHOOK_SECRET"),
  git_ssh_key_source: "/etc/chartmart/.ssh/id_rsa",
  git_ssh_key_destination: {:home, ".ssh"}