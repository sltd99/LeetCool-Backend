function dailyReportTemplate(usersDid, usersDidNot, dailyQuestion) {
  var template = ` 
    <span>今天的daily 是 <a href='${dailyQuestion.question_url}'> ${dailyQuestion.question_id}:  ${dailyQuestion.question_title}</a> 🧐</span>
    <div>
    <p>嗯~ o(*￣▽￣*)o， 昨天下面几位同学没有做daily。 加油 (●'◡'●)</p>
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
        </tr>  
    `;
  usersDidNot.map((user) => {
    template += `
        <tr style='border: 1px solid black; border-collapse: collapse'>
            <th style='border: 1px solid black; border-collapse: collapse'>
            ${user.user_name}
            </th>
            <th style='border: 1px solid black; border-collapse: collapse'>
            ${user.user_email}
            </th>
        </tr>
        `;
  });
  template += `
    </table>
    <br />
    <br />
    <p>嗯~ o(*￣▽￣*)o， 表扬一下下面的同学。 别骄傲 ╰(*°▽°*)╯</p>
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
        </tr>`;

  usersDid.map((user) => {
    template += `
        <tr style='border: 1px solid black; border-collapse: collapse'>
            <th style='border: 1px solid black; border-collapse: collapse'>
            ${user.user_name}
            </th>
            <th style='border: 1px solid black; border-collapse: collapse'>
            ${user.user_email}
            </th>
        </tr>
     `;
  });
  template += `
        </table>
    </div>`;
  return template.split("\n").join("");
}

module.exports.dailyReportTemplate = dailyReportTemplate;
