function weeklyReportTemplate(users) {
  var template = ` 
      <div>
      <p>嗯~ o(*￣▽￣*)o， 下面是同学们从开始到现在一共做的题 加油 (●'◡'●)</p>
      <table
          style='
          width: 100%;
          border: 1px solid black;
          border-collapse: collapse;
          text-align: center;
          '
      >
          <tr style='border: 1px solid black; border-collapse: collapse'>
          <th style='border: 1px solid black; border-collapse: collapse'>
              Name
          </th>
          <th style='border: 1px solid black; border-collapse: collapse'>
              Email
          </th>
          <th style='border: 1px solid black; border-collapse: collapse'>
              Total Question Amount
          </th>
          </tr>  
      `;
  users.map((user) => {
    template += `
            <tr style='border: 1px solid black; border-collapse: collapse'>
                <th style='border: 1px solid black; border-collapse: collapse'>
                ${user.user_name}
                </th>
                <th style='border: 1px solid black; border-collapse: collapse'>
                ${user.user_email}
                </th>
                <th style='border: 1px solid black; border-collapse: collapse'>
                ${user.total_question_amount}
                </th>
            </tr>
            `;
  });
  template += `
          </table>
      </div>`;
  return template.split("\n").join("");
}

module.exports.weeklyReportTemplate = weeklyReportTemplate;
