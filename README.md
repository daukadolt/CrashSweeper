# CrashSweeper 🚨💥 [![Better Stack Badge](https://uptime.betterstack.com/status-badges/v3/monitor/21a9g.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

<img src=".github/assets/techies-dota2-optimized.gif" alt="CrashSweeper Demo" width="100" />

A Minesweeper game with a twist - it crashes either when you click on a mine, or when you visit at the wrong time of day! ¯\\_(ツ)_/¯

## Inspiration

1. **Classic Minesweeper**: Inspired by [nickarocho/minesweeper](https://github.com/nickarocho/minesweeper) - the classic game with the classic Windows '95 look
2. **Dota 2 Minesweeper**: Also inspired by the [Dota 2 Minesweeper game](https://www.youtube.com/watch?v=Csmo4y1ufpU)

## The Twist

Unlike traditional Minesweeper, this game has a unique crash monitoring system:
- **Click on a mine** - triggers a crash event stored in Redis
- **Real-time monitoring** - BetterStack detects crashes via API endpoints
- **Persistent crash state** - crash events are stored for 5 minutes with automatic cleanup

## Purpose of the Project

1. **Test BetterStack.com Integration**: Monitor API crashes and performance in real-time
2. **Demonstrate Redis-based State Management**: Store and retrieve crash events with TTL
3. **Excuse to play with Terraform** ¯\\_(ツ)_/¯

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Infrastructure**: Terraform + AWS (S3, CloudFront, API Gateway, Lambda, ElastiCache Redis)
- **Monitoring**: BetterStack.com (for crash detection)
- **Deployment**: Static site hosted on AWS S3 with CloudFront CDN

## Live Demo

- **Game**: [https://crashsweeper.amirdnur.dev](https://crashsweeper.amirdnur.dev)
- **API**: [https://api.crashsweeper.amirdnur.dev](https://api.crashsweeper.amirdnur.dev)
- **Status Page**: [https://status.amirdnur.dev/](https://status.amirdnur.dev/)

## API Endpoints

### Monitor Endpoint (for BetterStack)
```
GET https://api.crashsweeper.amirdnur.dev/minesweeper-monitor
```
Returns:
- `200` - System healthy
- `500` - Crash detected (when crash events exist in Redis)

### Crash Store Endpoint (simulates mine click)
```
POST https://api.crashsweeper.amirdnur.dev/crash
```
Stores a crash event in Redis with 5-minute TTL.

## Infrastructure

The project uses Terraform to deploy:

- **S3 Bucket**: Static website hosting
- **CloudFront**: CDN with HTTPS and custom domain
- **API Gateway**: REST API with custom domain
- **Lambda Functions**: 
  - `crash-store`: Stores crash events in Redis
  - `minesweeper-monitor`: Checks for crash events
- **ElastiCache Redis**: Stores crash events with TTL
- **ACM Certificate**: SSL for both domains

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run locally: `npm run dev`
4. Deploy to AWS: `terraform apply`

## Game Rules

- Click on cells to reveal them
- Numbers show how many mines are adjacent
- Use Shift+Click to flag potential mines
- Don't click on mines... or test the monitoring system! 💥

## Monitoring Setup

### BetterStack Configuration
1. Add a new monitor with URL: `https://api.crashsweeper.amirdnur.dev/minesweeper-monitor`
2. Set expected status codes: 200 (healthy) or 500 (crashed)
3. Configure alert notifications for 500 responses
4. View real-time status at: [https://status.amirdnur.dev/](https://status.amirdnur.dev/)

**Note**: This project uses BetterStack to monitor the API endpoints and display real-time status information.

### Testing Crashes
- **Simulate mine click**: `curl -X POST https://api.crashsweeper.amirdnur.dev/crash`
- **Check status**: `curl https://api.crashsweeper.amirdnur.dev/minesweeper-monitor`
- **Monitor in real-time**: Visit [https://status.amirdnur.dev/](https://status.amirdnur.dev/) to see live status

## Deployment

After building the project, deploy your static site to S3 with:

```sh
aws s3 sync ./dist s3://crashsweeper.amirdnur.dev --delete
```

The game is deployed as a static website on AWS S3 using Terraform. Check out the `main.tf` file for the infrastructure configuration.

---

*Built with ❤️ and a dash of chaos*
