# CrashSweeper 🚨💥

<img src=".github/assets/techies-dota2.gif" alt="CrashSweeper Demo" width="100" />

A Minesweeper game with a twist - it crashes either when you click on a mine, or when you visit at the wrong time of day! ¯\\_(ツ)_/¯

## Inspiration

1. **Classic Minesweeper**: Inspired by [nickarocho/minesweeper](https://github.com/nickarocho/minesweeper) - the classic game with the classic Windows '95 look
2. **Dota 2 Minesweeper**: Also inspired by the [Dota 2 Minesweeper game](https://www.youtube.com/watch?v=Csmo4y1ufpU)

## The Twist

Unlike traditional Minesweeper, this game has two ways to "crash":
- **Click on a mine** - classic game over
- **Visit at the wrong time** - the entire website crashes! (Perfect for testing monitoring tools)

## Purpose of the Project

1. **Test BetterStack.com Integration**: Monitor website crashes and performance in real-time
2. **Excuse to play with Terraform** ¯\\_(ツ)_/¯

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Infrastructure**: Terraform + AWS S3
- **Monitoring**: BetterStack.com (for crash detection)
- **Deployment**: Static site hosted on AWS S3

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run locally: `npm run dev`
4. Deploy to AWS: `terraform apply`

## Game Rules

- Click on cells to reveal them
- Numbers show how many mines are adjacent
- Use Shift+Click to flag potential mines
- Don't click on mines... or visit at the wrong time! ⏰💥

## Deployment

The game is deployed as a static website on AWS S3 using Terraform. Check out the `main.tf` file for the infrastructure configuration.

---

*Built with ❤️ and a dash of chaos*
