const vscode = require("vscode");
const path = require("path");
const open = require("openurl");
const express = require("express");
const app = express();
const webSocket = require("ws");
const port = 9000;
const websocketPort = 9001;

const slashComments = ["c", "java", "cpp", "go", "javascript", "php", "rust"];
const hashComments = ["python", "ruby", "r", "perl"];

app.use("/", express.static(path.join(__dirname, "ui")));

app.listen(port, () => {
  vscode.window.showInformationMessage(`Server running at localhost:${port}`);

  open.open(`http://localhost:${port}`);
});

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // vscode.window.showWarningMessage("Anis's first VS code Extension");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "speech-to-comment-extension.writeCommentsForMe",
    () => {
      // The code you place here will be executed every time your command is executed
      //   vscode.window.showInformationMessage(
      //     `Current workspace ${vscode.workspace.name}`
      //   );
      // Display a message box to the user

      const wss = new webSocket.Server({ port: websocketPort });
      let message = "";
      let isMessage = false;
      wss.on("connection", (socket) => {
        console.log("New Socket");

        vscode.window.showInformationMessage("New Socket");

        socket.on("message", (phrase) => {
          // console.log(`New Message: ${phrase}`);
          phrase = "// " + phrase;
          const path = vscode.window.activeTextEditor?.document.fileName;
          const ext = vscode.window.activeTextEditor?.document.languageId;
          console.log(ext);
          if (path) {
            if (slashComments.includes(ext)) {
              message += "// ";
              isMessage = true;
            } else if (hashComments.includes(ext)) {
              message += "# ";
              isMessage = true;
            } else {
              vscode.window.showErrorMessage(
                `${ext} language is not supported yet`
              );
            }

            const edit = new vscode.WorkspaceEdit();
            const uri = vscode.Uri.file(path);
            const cursorPos = vscode.window.activeTextEditor?.selection.active;
            const position = new vscode.Position(
              cursorPos?.line || 0,
              cursorPos?.character || 0
            );
            edit.insert(uri, position, phrase + "\n");
            vscode.workspace.applyEdit(edit).then(() => {
              if (isMessage) {
                vscode.window.showInformationMessage("Comment successfull");
              }
            });
          }
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
