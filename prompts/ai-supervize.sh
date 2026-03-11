 unset OPENAI_API_KEY && unset OPENAI_BASE_URL && 

codex \
    -c forced_login_method=chatgpt \
    -c model_reasoning_effort='"xhigh"' \
  --ask-for-approval never \
  exec \
  --model gpt-5.4 \
  --local-provider none \
  --sandbox danger-full-access \
  -C /c/Users/me/work/promptbook-experiments-and-landing-pages/aldaron \
  <<'CODEX_PROMPT'

Visually enhance subpage `/ai-supervize`

Look at prompts/screenshots/image.png



CODEX_PROMPT