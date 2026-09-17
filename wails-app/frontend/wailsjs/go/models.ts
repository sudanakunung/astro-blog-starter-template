export namespace models {
	
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

