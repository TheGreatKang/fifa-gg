const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('cross-fetch');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('더보기')
    .setDescription('FIFA 온라인 4 1:1 전적을 더 많이 검색합니다.')
    .addStringOption(option =>
      option.setName('내닉네임')
        .setDescription('내 FIFA 온라인 4 닉네임')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('상대닉네임')
        .setDescription('상대방 FIFA 온라인 4 닉네임')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('오프셋')
        .setDescription('검색 시작 위치 (기본값: 100)')
        .setRequired(false)),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    const myNickname = interaction.options.getString('내닉네임');
    const opponentNickname = interaction.options.getString('상대닉네임');
    const offset = interaction.options.getInteger('오프셋') || 100;
    
    try {
      // 내 닉네임으로 accessId 가져오기
      console.log(`요청 URL: https://open.api.nexon.com/fconline/v1/id?nickname=${encodeURIComponent(myNickname)}`);
      
      const myResponse = await fetch(`https://open.api.nexon.com/fconline/v1/id?nickname=${encodeURIComponent(myNickname)}`, {
        headers: { 'Authorization': process.env.API_KEY }
      });
      
      if (!myResponse.ok) {
        const errorText = await myResponse.text().catch(e => 'No response body');
        console.error(`API 오류 내용: ${errorText}`);
        throw new Error(`API 응답 오류: ${myResponse.status} - ${errorText}`);
      }
      
      const myAccessId = await myResponse.json();
      
      if (!myAccessId || !myAccessId.accessId) {
        return interaction.editReply(`'${myNickname}' 닉네임을 찾을 수 없습니다.`);
      }
      
      // 상대방 닉네임으로 accessId 가져오기
      console.log(`요청 URL: https://open.api.nexon.com/fconline/v1/id?nickname=${encodeURIComponent(opponentNickname)}`);
      
      const opponentResponse = await fetch(`https://open.api.nexon.com/fconline/v1/id?nickname=${encodeURIComponent(opponentNickname)}`, {
        headers: { 'Authorization': process.env.API_KEY }
      });
      
      if (!opponentResponse.ok) {
        const errorText = await opponentResponse.text().catch(e => 'No response body');
        console.error(`API 오류 내용: ${errorText}`);
        throw new Error(`API 응답 오류: ${opponentResponse.status} - ${errorText}`);
      }
      
      const opponentAccessId = await opponentResponse.json();
      
      if (!opponentAccessId || !opponentAccessId.accessId) {
        return interaction.editReply(`'${opponentNickname}' 닉네임을 찾을 수 없습니다.`);
      }
      
      // 내 매치 ID 목록 가져오기 (1:1 매치 타입 40)
      console.log(`요청 URL: https://open.api.nexon.com/fconline/v1/matches?game_type=40&offset=${offset}&limit=100&nickname=${encodeURIComponent(myNickname)}`);
      
      const matchResponse = await fetch(`https://open.api.nexon.com/fconline/v1/matches?game_type=40&offset=${offset}&limit=100&nickname=${encodeURIComponent(myNickname)}`, {
        headers: { 'Authorization': process.env.API_KEY }
      });
      
      if (!matchResponse.ok) {
        const errorText = await matchResponse.text().catch(e => 'No response body');
        console.error(`API 오류 내용: ${errorText}`);
        throw new Error(`API 응답 오류: ${matchResponse.status} - ${errorText}`);
      }
      
      const matchIds = await matchResponse.json();
      
      if (!matchIds || matchIds.length === 0) {
        return interaction.editReply(`'${myNickname}'님의 추가 1:1 매치 기록이 없습니다.`);
      }
      
      // 매치 상세 정보 가져오기
      const matchInfos = await Promise.all(matchIds.map(async matchId => {
        console.log(`요청 URL: https://open.api.nexon.com/fconline/v1/match-detail?match_id=${matchId}`);
        
        const res = await fetch(`https://open.api.nexon.com/fconline/v1/match-detail?match_id=${matchId}`, {
          headers: { 'Authorization': process.env.API_KEY }
        });
        
        if (!res.ok) {
          console.error(`매치 ID ${matchId} 정보 가져오기 실패: ${res.status}`);
          return null;
        }
        
        return res.json();
      }));
      
      // 유효한 매치 정보만 필터링
      const validMatchInfos = matchInfos.filter(match => match !== null);
      
      // 상대방과의 매치만 필터링
      const filteredMatches = validMatchInfos.filter(match => 
        match.matchInfo && match.matchInfo.some(player => player.nickname === opponentNickname)
      );
      
      if (filteredMatches.length === 0) {
        return interaction.editReply(`'${myNickname}'님과 '${opponentNickname}'님의 추가 1:1 매치 기록이 없습니다.`);
      }
      
      // 매치 결과 임베드 생성
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${myNickname} vs ${opponentNickname} 1:1 전적 (추가 기록)`)
        .setDescription(`오프셋 ${offset}부터 ${filteredMatches.length}개의 매치 결과입니다.`)
        .setTimestamp();
      
      // 최대 10개의 매치만 표시
      const displayMatches = filteredMatches.slice(0, 10);
      
      // 매치 결과 추가
      displayMatches.forEach((match, index) => {
        let [userA, userB] = match.matchInfo;
        
        // userA가 항상 내 정보가 되도록 설정
        if (userA.nickname !== myNickname) [userA, userB] = [userB, userA];
        
        // 승패 결과
        let result;
        if (userA.shoot.goalTotalDisplay > userB.shoot.goalTotalDisplay) {
          result = '승리';
        } else if (userA.shoot.goalTotalDisplay < userB.shoot.goalTotalDisplay) {
          result = '패배';
        } else {
          result = '무승부';
        }
        
        // 매치 날짜 포맷팅
        const matchDate = new Date(match.matchDate).toLocaleDateString('ko-KR');
        
        // 필드 추가
        embed.addFields({
          name: `매치 #${index + 1 + offset} (${matchDate}) - ${result}`,
          value: `${userA.nickname} ${userA.shoot.goalTotalDisplay} : ${userB.shoot.goalTotalDisplay} ${userB.nickname}\n` +
                 `슈팅: ${userA.shoot.shootTotal} : ${userB.shoot.shootTotal}\n` +
                 `유효슈팅: ${userA.shoot.effectiveShootTotal} : ${userB.shoot.effectiveShootTotal}\n` +
                 `패스성공률: ${Math.round(userA.pass.passSuccess / userA.pass.passTry * 100)}% : ${Math.round(userB.pass.passSuccess / userB.pass.passTry * 100)}%\n` +
                 `오프사이드: ${userA.matchDetail.offsideCount} : ${userB.matchDetail.offsideCount}`
        });
      });
      
      // 더 많은 매치가 있는 경우 안내 메시지 추가
      if (filteredMatches.length > 10) {
        embed.setFooter({ 
          text: `더 많은 매치가 있습니다. 다음 검색을 위해 /더보기 명령어에 오프셋 ${offset + 100}을 입력하세요.` 
        });
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('전적 검색 중 오류 발생:', error);
      await interaction.editReply(`전적 검색 중 오류가 발생했습니다: ${error.message}`);
    }
  }
};
