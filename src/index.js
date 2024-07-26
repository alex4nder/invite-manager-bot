import TelegramBot from "node-telegram-bot-api";
import express from "express";
import bodyParser from "body-parser";

require("dotenv").config();

const token = process.env.TOKEN;
const port = process.env.PORT || 8028;
const webhookUrl = process.env.WEBHOOK_URL;

if (!token || !webhookUrl) {
  console.error(
    "Token and webhook URL must be provided in environment variables"
  );
  process.exit(1);
}

const bot = new TelegramBot(token);
const app = express();

app.use(bodyParser.json());

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on("chat_join_request", (msg) => {
  const { chat, from } = msg;
  const chatId = chat.id;
  const userId = from.id;
  const userName = from.username;

  bot
    .approveChatJoinRequest(chatId, userId)
    .then(() => {
      bot.sendMessage(
        chatId,
        `User @${userName} has been added to the channel.`
      );
    })
    .catch((error) => {
      console.error(`Error confirming user request @${userName}:`, error);
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  bot.setWebHook(`${webhookUrl}/bot${token}`);
});
