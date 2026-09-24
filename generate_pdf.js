const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const port = 9222;

  console.log("Launching Edge headless...");
  const edgeProc = spawn(edgePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--disable-web-security"
  ]);

  edgeProc.stderr.on('data', d => {});

  // Wait for Edge to start
  await new Promise(r => setTimeout(r, 1500));

  let versionData;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      versionData = await res.json();
      if (versionData && versionData.webSocketDebuggerUrl) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!versionData) {
    console.error("Failed to connect to Edge CDP");
    edgeProc.kill();
    process.exit(1);
  }

  console.log("Connected to Edge:", versionData.Browser);

  // Create new target
  const newTargetRes = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const targetData = await newTargetRes.json();
  const pageWsUrl = targetData.webSocketDebuggerUrl;

  const ws = new WebSocket(pageWsUrl);

  let idCounter = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand("Page.enable");
  await sendCommand("Runtime.enable");

  const htmlPath = path.resolve(__dirname, "docs/system_documentation.html").replace(/\\/g, '/');
  console.log("Navigating to:", `file:///${htmlPath}`);

  await sendCommand("Page.navigate", { url: `file:///${htmlPath}` });

  // Wait for document and mermaid rendering
  console.log("Waiting for rendering completion...");
  for (let i = 0; i < 30; i++) {
    const evalRes = await sendCommand("Runtime.evaluate", {
      expression: "window.DOC_READY === true"
    });
    if (evalRes && evalRes.result && evalRes.result.value === true) {
      console.log("Document signaled DOC_READY!");
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Brief stabilization pause
  await new Promise(r => setTimeout(r, 1000));

  console.log("Generating PDF via Page.printToPDF...");
  const pdfResult = await sendCommand("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0
  });

  const pdfBuffer = Buffer.from(pdfResult.data, 'base64');
  const outPath = path.resolve(__dirname, "docs/ShopFlow_System_Architecture_Priyanshu_Ghosh.pdf");
  fs.writeFileSync(outPath, pdfBuffer);
  console.log(`PDF successfully created at ${outPath} (${pdfBuffer.length} bytes)`);

  ws.close();
  edgeProc.kill();
  console.log("Done!");
}

main().catch(err => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
