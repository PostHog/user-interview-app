# User Interview App

Invite your users to an interview through an in-app pop-up with this app.

## Installation

1. Make sure you have enabled `opt_in_site_apps: true` in your posthog-js config.
2. Install the app from the PostHog App Repository
3. Customize the text

## Adding a user interview

1. Create a feature flag to control who sees it. And set the filter `Seen User Interview Invitation - {featureFlagName}` to `is not set` so that it doesn't show to users who have seen the user interview already.
   ![Feature flag user interview not set](feature-flag-config.png)
2. Add the feature flag and booking link to the app config `interviewConfigs` (you can have multiple feature flags with corresponding booking links by separating them with commas e.g. interview_high_icp=https://calendly.com/user1/book-high-icp,interview_low_icp=https://calendly.com/user1/book-high-icp)
3. Rollout out the feature flag

The flags won't be shown to users who have seen a user interview popup within the last 90 days (configured with `minDaysSinceLastSeenPopUp`)

## Demo

![Example popup](example.png)

## Tracking events

| Event name | Properties | Notes |
| ---------- | ----------- | ----------- |
| `User Interview Shown Pop Up` | `{featureFlagName: featureFlagName}` | |
| `User Interview Dismissed Pop Up` | `{featureFlagName: featureFlagName}` | |
| `User Interview Clicked Book Button` | `{featureFlagName: featureFlagName}` | |
| `User Interview Booked` | `{featureFlagName: featureFlagName}` | Requires the redirect after booking to be setup |

## User properties

| Property name | Notes |
| ------------- | ----------- |
| `Seen User Interview Invitation - featureFlagName}` | Date when the user interview invitation was shown |

## Local development

For local development, clone the repo and run

```bash
npx @posthog/app-dev-server
```

or

```bash
pnpm install
pnpm start
```
