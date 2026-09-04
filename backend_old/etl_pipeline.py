# etl_pipeline.py - Complete ETL orchestration
import logging
from datetime import datetime
from extract import StockExtractor
from transform import StockTransformer
from load import StockLoader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ETLPipeline:
    def __init__(self):
        self.extractor = StockExtractor()
        self.transformer = StockTransformer()
        self.loader = StockLoader()
    
    def run_full_etl(self, stock_list):
        """Run complete ETL pipeline for stock universe"""
        logger.info(f"Starting ETL pipeline for {len(stock_list)} stocks")
        
        # 1. Extract
        logger.info("Extracting raw stock data...")
        raw_data, failed = self.extractor.extract_batch(stock_list)
        logger.info(f"Extracted {len(raw_data)} stocks, {len(failed)} failed")
        
        # 2. Transform
        logger.info("Transforming stock data & calculating risk scores...")
        transformed_data = self.transformer.transform_batch(list(raw_data.values()))
        logger.info(f"Transformed {len(transformed_data)} stocks")
        
        # 3. Load
        logger.info("Loading stock data into SQLite storage...")
        self.loader.load_batch(transformed_data)
        logger.info("Database load complete")
        
        return {
            'success': len(transformed_data),
            'failed': len(failed),
            'timestamp': datetime.now().isoformat()
        }
    
    def incremental_update(self, stock_list):
        """Incremental update for existing stocks"""
        logger.info(f"Running incremental update for {len(stock_list)} stocks")
        
        raw_data, failed = self.extractor.extract_batch(stock_list)
        transformed_data = self.transformer.transform_batch(list(raw_data.values()))
        
        for data in transformed_data:
            self.loader.load_stock(data)
        
        return {
            'updated': len(transformed_data),
            'failed': len(failed),
            'timestamp': datetime.now().isoformat()
        }

# Singleton instance
pipeline = ETLPipeline()
