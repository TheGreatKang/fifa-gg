const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('도움말')
    .setDescription('FIFA 온라인 4 전적 검색 봇 사용법을 안내합니다.'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('FIFA 온라인 4 전적 검색 봇 도움말')
      .setDescription('FIFA 온라인 4의 1:1 전적을 검색하고 통계를 확인할 수 있는 봇입니다.')
      .addFields(
        { name: '/전적검색', value: '두 사용자 간의 1:1 전적을 검색합니다.\n내 닉네임과 상대방 닉네임을 입력해야 합니다.' },
        { name: '/더보기', value: '이전 검색 결과 이후의 추가 매치를 검색합니다.\n내 닉네임, 상대방 닉네임, 오프셋(선택)을 입력해야 합니다.' },
        { name: '/도움말', value: '이 도움말을 표시합니다.' }
      )
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
