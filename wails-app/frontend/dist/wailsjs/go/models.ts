export namespace models {
	
	export class Banner {
	    id: string;
	    store_id: string;
	    title: string;
	    image_url: string;
	    link_url: string;
	    link_text: string;
	    order_num: number;
	    is_active: number;
	    created_at?: number;
	    updated_at?: number;
	
	    static createFrom(source: any = {}) {
	        return new Banner(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.store_id = source["store_id"];
	        this.title = source["title"];
	        this.image_url = source["image_url"];
	        this.link_url = source["link_url"];
	        this.link_text = source["link_text"];
	        this.order_num = source["order_num"];
	        this.is_active = source["is_active"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class ConnectionTestResult {
	    ok: boolean;
	    message: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new ConnectionTestResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ok = source["ok"];
	        this.message = source["message"];
	        this.error = source["error"];
	    }
	}
	export class Product {
	    id: string;
	    store_id: string;
	    name: string;
	    slug: string;
	    description: string;
	    price: number;
	    stock: number;
	    image_url: string;
	    weight_gram: number;
	    is_active: number;
	    created_at?: number;
	    updated_at?: number;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.store_id = source["store_id"];
	        this.name = source["name"];
	        this.slug = source["slug"];
	        this.description = source["description"];
	        this.price = source["price"];
	        this.stock = source["stock"];
	        this.image_url = source["image_url"];
	        this.weight_gram = source["weight_gram"];
	        this.is_active = source["is_active"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class StoreConfig {
	    store_id: string;
	    store_name: string;
	    worker_url: string;
	    internal_token: string;
	    deploy_hook_url: string;
	
	    static createFrom(source: any = {}) {
	        return new StoreConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.store_id = source["store_id"];
	        this.store_name = source["store_name"];
	        this.worker_url = source["worker_url"];
	        this.internal_token = source["internal_token"];
	        this.deploy_hook_url = source["deploy_hook_url"];
	    }
	}
	export class StoreSettings {
	    store_id: string;
	    name?: string;
	    mayar_api_key: string;
	    mayar_webhook_secret: string;
	    biteship_api_key: string;
	
	    static createFrom(source: any = {}) {
	        return new StoreSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.store_id = source["store_id"];
	        this.name = source["name"];
	        this.mayar_api_key = source["mayar_api_key"];
	        this.mayar_webhook_secret = source["mayar_webhook_secret"];
	        this.biteship_api_key = source["biteship_api_key"];
	    }
	}
	export class StoreSettingsStatus {
	    store_id: string;
	    name: string;
	    has_mayar_key: boolean;
	    mayar_key_preview: string;
	    has_mayar_webhook: boolean;
	    has_biteship_key: boolean;
	    biteship_key_preview: string;
	
	    static createFrom(source: any = {}) {
	        return new StoreSettingsStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.store_id = source["store_id"];
	        this.name = source["name"];
	        this.has_mayar_key = source["has_mayar_key"];
	        this.mayar_key_preview = source["mayar_key_preview"];
	        this.has_mayar_webhook = source["has_mayar_webhook"];
	        this.has_biteship_key = source["has_biteship_key"];
	        this.biteship_key_preview = source["biteship_key_preview"];
	    }
	}
	export class SyncResult {
	    product_id: string;
	    product_name: string;
	    success: boolean;
	    message: string;
	    d1_status: string;
	    deploy_hook_status: string;
	    timestamp: number;
	
	    static createFrom(source: any = {}) {
	        return new SyncResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.product_id = source["product_id"];
	        this.product_name = source["product_name"];
	        this.success = source["success"];
	        this.message = source["message"];
	        this.d1_status = source["d1_status"];
	        this.deploy_hook_status = source["deploy_hook_status"];
	        this.timestamp = source["timestamp"];
	    }
	}

}

