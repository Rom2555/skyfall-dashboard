[
	{
		"where": {
			"clerk_id": {
				"not": null
			}
		}
	},
	{
		"console.log('User": ", { id: user.id, email: user.email, clerkId: user.clerk_id });\n\n    // Update or create settings\n    const existingSettings = await prisma.settings.findFirst({\n      where: { user_id: user.id }\n    });\n\n    if (existingSettings) {\n      await prisma.settings.update({\n        where: { id: existingSettings.id },\n        data: {\n          traffic_source: 'facebook",
		"traffic_source_api_key": "EAAVfZAVU7IjkBQctCnMhQWJdi1aIW8WLXwqo7LII9Hp9rZAZBru55JWhZApLWzlRpooixrFpCibm5a0RKLEJ5JqtyMwSPec4ycxksDZAUGu7KpQlEofqZApBBZCELcTCrwnrUfemnCBkhDgTUpaEZAPZCN5X0ZC5YU7RZB1c3nWPmMwpEg4lkZCJMZCFJNPc0rrojZAFZBRUnZCTDD79uMrdT25A",
		"vertical": "other",
		"geo": "RU",
		"updated_at": "new Date()"
	},
	{
		"data": {
			"user_id": "user.id",
			"traffic_source": "facebook",
			"traffic_source_api_key": "EAAVfZAVU7IjkBQctCnMhQWJdi1aIW8WLXwqo7LII9Hp9rZAZBru55JWhZApLWzlRpooixrFpCibm5a0RKLEJ5JqtyMwSPec4ycxksDZAUGu7KpQlEofqZApBBZCELcTCrwnrUfemnCBkhDgTUpaEZAPZCN5X0ZC5YU7RZB1c3nWPmMwpEg4lkZCJMZCFJNPc0rrojZAFZBRUnZCTDD79uMrdT25A",
			"vertical": "other",
			"geo": "RU"
		}
	},
	{
		"data": {
			"project_name": "Facebook - Russia",
			"vertical": "other",
			"geo": "RU",
			"target_cpa": 180,
			"min_conversion_rate": 2.5,
			"is_active": true
		}
	},
	{
		"where": {
			"id": "user.id"
		},
		"data": {
			"is_onboarding_completed": true
		}
	},
	{
		"console.error('Error": ", error);\n  } finally {\n    await prisma.$disconnect();\n  }\n}\n\naddFacebookSettings();"
	}
]