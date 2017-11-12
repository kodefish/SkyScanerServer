package com.lauzhack.skytravel;

import android.app.SearchManager;
import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Html;
import android.text.method.LinkMovementMethod;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import com.lauzhack.skytravel.utils.Flight;

import java.util.ArrayList;
import java.util.List;

public class BuyActivity extends AppCompatActivity {

    private ListView mListView;
    private ArrayAdapter mAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_buy);

        final ArrayList<Flight> flights = (ArrayList<Flight>) this.getIntent().getSerializableExtra("flights");

        mListView = (ListView) findViewById(R.id.listBuy);

        mAdapter = new ArrayAdapter(this, android.R.layout.simple_list_item_1, flights);
        mListView.setAdapter(mAdapter);
        mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
               Flight flight = flights.remove(position);
               mAdapter.notifyDataSetChanged();
               Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(flight.getTicketLink()));
               startActivity(intent);
            }
        });
    }
}
