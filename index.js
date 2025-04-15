require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');

// Discord 클라이언트 생성
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// 명령어 컬렉션 초기화
client.commands = new Collection();
const commands = [];

// 명령어 파일 로드
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(`[경고] ${filePath} 명령어에 필요한 "data" 또는 "execute" 속성이 없습니다.`);
  }
}

// 봇이 준비되었을 때 실행되는 이벤트
client.once('ready', async () => {
  console.log(`${client.user.tag} 봇이 준비되었습니다!`);
  
  // 슬래시 명령어 등록
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('슬래시 명령어를 등록하는 중...');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    
    console.log('슬래시 명령어 등록 완료!');
  } catch (error) {
    console.error('슬래시 명령어 등록 중 오류 발생:', error);
  }
});

// 슬래시 명령어 처리
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) return;
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '명령어 실행 중 오류가 발생했습니다.',
      ephemeral: true
    });
  }
});

// 봇 로그인
client.login(process.env.DISCORD_TOKEN);
