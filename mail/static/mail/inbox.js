document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#output").style.display = "none";
  document.querySelector("#single").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  document.querySelector("form").onsubmit = (e) => {
    e.preventDefault();

    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: document.querySelector("#compose-recipients").value,
        subject: document.querySelector("#compose-subject").value,
        body: document.querySelector("#compose-body").value,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        document.querySelector("#sent");
        load_mailbox("sent");
      });
  };
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#output").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#single").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Loading the mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      let output = "";
      emails.forEach(function (email) {
        if (email.read === true) {
          output += `
        <div id="${email.id}" onclick="email_detail(${email.id})" class="bg-secondary text-white card card-body mb-3">
				    <h3>${email.sender}</h3>
				    <p>${email.subject}</p>
            <p>${email.timestamp}</p>
			    </div>
        `;
        } else {
          output += `
          <div id="${email.id}" onclick="email_detail(${email.id})" class="card card-body mb-3">
				    <h3>${email.sender}</h3>
				    <p>${email.subject}</p>
            <p>${email.timestamp}</p>
			    </div>
        `;
        }
      });
      document.querySelector("#output").innerHTML = output;
    });
};

// Loading an individual email
function email_detail(id) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#output").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#single").style.display = "block";

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      let single = `
			<div>
				<p><strong>From:</strong> ${email.sender}</p>
        <p><strong>To:</strong> ${email.recipients}</p>
				<p><strong>Subject:</strong> ${email.subject}</p>
        <p><strong>Timestamp:</strong> ${email.timestamp}</p>
        <button id="${email.id}" onclick="reply(${email.id})"
        class="btn btn-sm btn-outline-primary reply-btn">Reply</button> 
        <button id="${email.id}" onclick="archive(${email.id}, ${email.archived})" class="btn btn-sm btn-outline-primary archive-btn"></button>
        <p class="mt-4">${email.body}</p>
			</div>
    `;
    document.querySelector("#single").innerHTML = single;
    if (email.archived === true) {
      document.querySelector(".archive-btn").innerHTML = "Unarchive";
    } else {
      document.querySelector(".archive-btn").innerHTML = "Archive";
    }
  })
};

function archive(id, archived) {
  let archiveState;
  
  if (archived === false) {
    archiveState = true;
  } else {
    archiveState = false;
  }

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: archiveState
    }),
  })
    .then((result) => {
      console.log(result);
      document.querySelector("#inbox");
      load_mailbox("inbox");
    });
};

function reply(id) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#output").style.display = "none";
  document.querySelector("#single").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Pre fill composition fields
      document.querySelector("#compose-recipients").value = `${email.sender}`;
      document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
      document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote:\n ${email.body}\n`;
    })
  document.querySelector("form").onsubmit = (e) => {
    e.preventDefault();

    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: document.querySelector("#compose-recipients").value,
        subject: document.querySelector("#compose-subject").value,
        body: document.querySelector("#compose-body").value,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        document.querySelector("#sent");
        load_mailbox("sent");
      });
  };
};