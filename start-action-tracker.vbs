Option Explicit

Dim shell, fileSystem, projectFolder, nodePath, serverScript, trackerUrl
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")

projectFolder = fileSystem.GetParentFolderName(WScript.ScriptFullName)
nodePath = shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\nodejs\node.exe"
If Not fileSystem.FileExists(nodePath) Then nodePath = "node.exe"
serverScript = fileSystem.BuildPath(projectFolder, "server.js")
trackerUrl = "http://localhost:3430/my-action-tracker.html"

' Start the existing SQLite API without opening a console window when it is not already running.
If Not backendIsRunning() Then
	shell.CurrentDirectory = projectFolder
	shell.Run Chr(34) & nodePath & Chr(34) & " " & Chr(34) & serverScript & Chr(34), 0, False
	WScript.Sleep 1200
End If
shell.Run trackerUrl, 1, False

Function backendIsRunning()
	On Error Resume Next
	Dim request
	Set request = CreateObject("MSXML2.XMLHTTP")
	request.Open "GET", "http://localhost:3430/api/state", False
	request.Send
	backendIsRunning = (Err.Number = 0 And request.Status = 200)
	Err.Clear
	On Error GoTo 0
End Function
