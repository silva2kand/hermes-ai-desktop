# Hermes Agent Configuration Backup

**Date:** 2026-07-18  
**User:** Silva Ka  
**System:** Windows 10

## Configuration Summary

### Primary Model
- **Provider:** Kiro (via OmniRouter)
- **Model:** `kr/claude-sonnet-4.5` (Claude Sonnet 4.5)
- **API Key:** HERMES (sk-1fb12d8f2429f2bd-m7x23g-7c639070)
- **Endpoint:** http://127.0.0.1:20128/v1

### Vision System
- **Provider:** custom:omnirouter
- **Model:** `gc/gemini-2.5-pro` (Gemini 2.5 Pro)
- **Status:** Fully operational with HERMES_ENABLE_MULTIMODAL=1

### OmniRouter (Port 20128)
- Kiro: Working ✓
- Gemini CLI: Working ✓
- Qoder: Unreliable (500 errors)

### Fallback Chain
1. Kiro (`kr/claude-sonnet-4.5`)
2. Gemini CLI (`gc/gemini-2.5-pro`)
3. Qoder (`qd/ultimate`)
4. OpenRouter free-tier
5. NVIDIA NIM free-tier
6. Ollama local models

### Email Accounts (8 total)
- silvak2023@outlook.com (Primary Business) - Microsoft Graph OAuth
- silvakretail@gmail.com (Secondary Business) - Gmail IMAP
- newtonstore0@gmail.com (Shop) - Gmail IMAP
- sva23@live.co.uk (Historical) - Microsoft Graph OAuth
- shivakand115@gmail.com - Gmail IMAP
- siyanthank@gmail.com - Gmail IMAP
- hermsilva26@gmail.com - Gmail IMAP
- silvak2620@gmail.com - Gmail IMAP

## Features Enabled
- ✅ Multimodal vision processing (Gemini 2.5 Pro)
- ✅ Email operations (4x daily automated fetch)
- ✅ Microsoft Graph API integration
- ✅ Gmail IMAP/SMTP integration
- ✅ OmniRouter multi-provider routing
- ✅ Free-tier AI model access only

## Restore Instructions

1. **Copy config files:**
   ```bash
   cp config.yaml ~/.hermes/
   cp BRAIN.yaml ~/.hermes/
   ```

2. **Set environment variable for multimodal:**
   ```cmd
   set HERMES_ENABLE_MULTIMODAL=1
   ```

3. **Restart Hermes Agent**

4. **Verify configuration:**
   ```bash
   hermes config show
   ```

## Last Updated
2026-07-18T21:47:00Z
