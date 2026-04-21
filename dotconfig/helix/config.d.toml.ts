declare const config: {
	readonly theme: string
	readonly editor: {
		readonly statusline: {
			readonly left: ReadonlyArray<string>
			readonly center: ReadonlyArray<string>
			readonly right: ReadonlyArray<string>
			readonly separator: string
			readonly mode: {
				readonly normal: string
				readonly insert: string
				readonly select: string
			}
		}
		readonly [key: string]: unknown
	}
	readonly [key: string]: unknown
}

export default config
