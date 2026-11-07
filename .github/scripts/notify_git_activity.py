import json
import os
import sys
import urllib.request

token = os.environ.get("SLACK_BOT_TOKEN")
if not token:
    print("SLACK_BOT_TOKEN not configured, skipping notification.")
    sys.exit(0)

channel = os.environ.get("CHANNEL", "C0CFRUJUCSE")
event_name = os.environ.get("EVENT_NAME", "")
repo = os.environ.get("REPO", "")
actor = os.environ.get("ACTOR", "")
ref_name = os.environ.get("REF_NAME", "")
head_commit = os.environ.get("HEAD_COMMIT", "")
short_sha = head_commit[:7] if head_commit else ""

payload = None

if event_name == "create":
    ref_type = os.environ.get("REF_TYPE", "")
    if ref_type == "branch":
        title = "🌿 [WONDERLAB] New Branch Created"
        color = "#059669"
        base_branch = os.environ.get("BASE_BRANCH", "develop")
        compare_url = f"https://github.com/{repo}/compare/{base_branch}...{ref_name}"

        payload = {
            "channel": channel,
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": title, "emoji": True},
                }
            ],
            "attachments": [
                {
                    "color": color,
                    "blocks": [
                        {
                            "type": "section",
                            "fields": [
                                {"type": "mrkdwn", "text": f"*Branch:*\n`{ref_name}`"},
                                {"type": "mrkdwn", "text": f"*Created By:*\n`@{actor}`"},
                                {"type": "mrkdwn", "text": f"*Base Ref:*\n`{base_branch}`"},
                                {"type": "mrkdwn", "text": "*Event:*\n`BRANCH_CREATED`"},
                            ],
                        },
                        {
                            "type": "actions",
                            "elements": [
                                {
                                    "type": "button",
                                    "text": {"type": "plain_text", "text": "🌿 Compare Branch"},
                                    "url": compare_url,
                                    "style": "primary",
                                }
                            ],
                        },
                    ],
                }
            ],
        }

elif event_name == "pull_request":
    pr_number = os.environ.get("PR_NUMBER", "")
    pr_title = os.environ.get("PR_TITLE", "")
    pr_url = os.environ.get("PR_URL", "")
    action = os.environ.get("PR_ACTION", "")
    is_merged = os.environ.get("PR_MERGED", "false") == "true"
    head_ref = os.environ.get("PR_HEAD_REF", "")
    base_ref = os.environ.get("PR_BASE_REF", "")

    if action == "closed" and is_merged:
        status_text = "MERGED"
        title = "🟣 [WONDERLAB] Pull Request Merged"
        color = "#8b5cf6"
    elif action == "closed":
        status_text = "CLOSED"
        title = "❌ [WONDERLAB] Pull Request Closed"
        color = "#64748b"
    elif action == "reopened":
        status_text = "REOPENED"
        title = "🔄 [WONDERLAB] Pull Request Reopened"
        color = "#0284c7"
    else:
        status_text = "OPEN"
        title = "🔀 [WONDERLAB] Pull Request Opened"
        color = "#0284c7"

    payload = {
        "channel": channel,
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": title, "emoji": True},
            }
        ],
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*PR:*\n`#{pr_number}`"},
                            {"type": "mrkdwn", "text": f"*Status:*\n`{status_text}`"},
                            {"type": "mrkdwn", "text": f"*Flow:*\n`{head_ref}` ➔ `{base_ref}`"},
                            {"type": "mrkdwn", "text": f"*Author:*\n`@{actor}`"},
                        ],
                    },
                    {
                        "type": "section",
                        "text": {"type": "mrkdwn", "text": f"*Title:*\n```{pr_title}```"},
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {"type": "plain_text", "text": "🔀 View Pull Request"},
                                "url": pr_url,
                                "style": "primary",
                            }
                        ],
                    },
                ],
            }
        ],
    }

elif event_name == "push":
    commit_count = os.environ.get("COMMIT_COUNT", "1")
    compare_url = os.environ.get("COMPARE_URL", "")
    commits_raw = os.environ.get("COMMITS_JSON", "[]")

    try:
        commits = json.loads(commits_raw) if commits_raw else []
    except Exception:
        commits = []

    lines = []
    if isinstance(commits, list):
        for c in commits[:5]:
            c_sha = c.get("id", "")[:7]
            msg = c.get("message", "").split("\n")[0].strip()
            lines.append(f"• {c_sha}: {msg}")
        if len(commits) > 5:
            lines.append(f"... and {len(commits) - 5} more commit(s)")

    if not lines:
        lines.append(f"• {short_sha}: Update {ref_name}")

    commit_log = "\n".join(lines)
    commit_link = f"<https://github.com/{repo}/commit/{head_commit}|`{short_sha}`>"

    payload = {
        "channel": channel,
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "📌 [WONDERLAB] New Commits Pushed", "emoji": True},
            }
        ],
        "attachments": [
            {
                "color": "#0284c7",
                "blocks": [
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Branch:*\n`{ref_name}`"},
                            {"type": "mrkdwn", "text": f"*Author:*\n`@{actor}`"},
                            {"type": "mrkdwn", "text": f"*Commits:*\n`{commit_count} commit(s)`"},
                            {"type": "mrkdwn", "text": f"*Latest SHA:*\n{commit_link}"},
                        ],
                    },
                    {
                        "type": "section",
                        "text": {"type": "mrkdwn", "text": f"*Commit Log:*\n```{commit_log}```"},
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {"type": "plain_text", "text": "🔍 View Changes"},
                                "url": compare_url if compare_url else f"https://github.com/{repo}/commits/{ref_name}",
                                "style": "primary",
                            }
                        ],
                    },
                ],
            }
        ],
    }

if payload:
    req = urllib.request.Request(
        "https://slack.com/api/chat.postMessage",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            print("Slack response:", body)
    except Exception as e:
        print("Failed to send Slack notification:", e)
