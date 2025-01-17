# WooCommerce Beta Tester

A plugin that makes it easy to test out pre-releases such as betas release canadidates and even final releases.

## Usage

You can get to the settings and features from your top admin bar under the name WC Beta Tester.

# WooCommerce Admin Test Helper

A plugin that makes it easier to test the WooCommerce Admin plugin. 

## Development

To get started, run the following commands:

```text
npm install
npm start
```

See [wp-scripts](https://github.com/WordPress/gutenberg/tree/master/packages/scripts) for more usage information.

## Extending

There are two client-side filters available if you want to extend the test
helper with your own plugin's test setup code.

This example adds a new tab:

```
import { addFilter } from '@wordpress/hooks';

const SuperSekret = () => (
	<>
		<h2>Super sekret</h2>
		<p>This section contains super sekret tools.</p>
		<NewTool/>
	</>
);
addFilter(
	'woocommerce_admin_test_helper_tabs',
	'wath',
	( tabs ) => [
		...tabs,
		{
			name: 'super-sekret',
			title: 'Super sekret',
			content: <SuperSekret/>,
		}
	]
);
```

This example adds a new tool to the existing Options tab:

```
import { addFilter } from '@wordpress/hooks';

const NewTool = () => (
	<>
		<strong>New tool</strong>
		<p>Description</p>
		<button>Execute</button>
	</>
);
addFilter(
	'woocommerce_admin_test_helper_tab_options',
	'wath',
	( entries ) => [
		...entries,
		<NewTool/>
	]
);
```

Register a REST API endpoint to perform server-side actions in the usual way:

```
add_action( 'rest_api_init', function() {
    register_rest_route(
        'your-plugin/v1',
        '/area/action',
        array(
            'methods' => 'POST',
            'callback' => 'your_plugin_area_action',
            'permission_callback' => function( $request ) {
                if ( ! wc_rest_check_manager_permissions( 'settings', 'edit ) ) {
                    return new \WP_Error(
                        'woocommerce_rest_cannot_edit',
                        __( 'Sorry, you cannot perform this action', 'your-plugin' )
                    );
                }
                return true;
            }
        )
    );
} );

function your_plugin_area_action() {
    return [];
}
```

This would be used on the client like this:

```
import apiFetch from '@wordpress/api-fetch';
...
const response = await apiFetch( {
    path: '/your-plugin/v1/area/action',
    method: 'POST',
} );
```

### Deploying

Prerequisites:

- [Hub](https://github.com/github/hub)
- Write access to this repository

You can create a test ZIP of the plugin using this command:

```
npm run build
```

This creates `woocommerce-admin-test-helper.zip` in the project root.

We release the plugin using GitHub Releases. There is a script to automate this:

0. Make sure the version is updated in `woocommerce-admin-test-helper.php` and `package.json`
1. Commit and push to `trunk`
2. Run `npm run release`
3. Make sure you provide the correct version number when prompted
4. That's it!
