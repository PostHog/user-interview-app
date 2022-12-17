# User Interview App

Invite your users to an interview through an in-app pop-up with this app.

## Installation

1. Make sure you have enabled `opt_in_site_apps: true` in your posthog-js config.
2. Install the app from the PostHog App Repository
3. Customize the text and add your booking link e.g. Calendly/Cal.com and enable the plugin
4. Set the calendar software to redirect to `?bookedUserInterview={feature_flag_name}` after the booking has been completed.
5. Create a feature flag to control who sees it. And set the filter `Seen User Interview Invitation - {feature_flag_name}` to `is not set` so that it doesn't show to users who have seen the user interview already.
   ![Feature flag user interview not set](feature-flag-config.png)

## Adding a user interview

1. Create a feature flag to control who sees it. And set the filter `Seen User Interview Invitation` to `is not set` so that it doesn't show to users who have seen the user interview already.
   ![Feature flag user interview not set](feature-flag-config.png)
2. Add the feature flag to the app config `featureFlagNames` (you can have multiple feature flags by separating them with commas e.g. interview_high_icp,interview_used_two_feature_flags)
3. Add the booking links to the app config `bookButtonURLs` (you can have multiple booking links by separating them with commas e.g. https://calendly.com/user1/book,https://calendly.com/user2/15min)
4. Rollout out the feature flag

The flags won't be shown to users who have seen a popup within the last 90 days (configured with `minDaysSinceLastSeenPopUp`)

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
