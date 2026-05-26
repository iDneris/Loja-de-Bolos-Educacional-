import { supabase } from '../configuracao/supabase';

async function addSobEncomendaColumn() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;'
    });

    if (error) {
      console.error('Erro ao executar SQL:', error);
      
      // Tenta usando SQL direto via query
      const { data, error: queryError } = await supabase
        .from('bolos')
        .select('sob_encomenda')
        .limit(1);
      
      if (queryError && queryError.code === 'PGRST116') {
        // Coluna não existe, vamos tentar usar SQL via REST API
        console.log('Tentando via REST API...');
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_KEYS?.split(',')[0] || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.SUPABASE_KEYS?.split(',')[0] || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''}`
          },
          body: JSON.stringify({ sql: 'ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;' })
        });
        
        if (response.ok) {
          console.log('Coluna sob_encomenda adicionada com sucesso!');
        } else {
          console.error('Erro ao adicionar coluna via REST API:', await response.text());
        }
      } else {
        console.log('Coluna sob_encomenda já existe ou foi adicionada com sucesso!');
      }
    } else {
      console.log('Coluna sob_encomenda adicionada com sucesso!');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

addSobEncomendaColumn();
